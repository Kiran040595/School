# Project Architecture & Deep Dive

This document provides a comprehensive technical overview of the application, detailing the logic, state management, and data flows within the frontend and its integration with the Google Apps Script backend.

## Technology Stack

- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Lucide Icons
- **Backend/Database**: Google Apps Script acting as a pseudo-REST API for a Google Sheet.

## Core Features & Logic Deep Dive

### 1. Attendance System

#### Admin Attendance (`src/components/AttendanceTab.tsx`)
- **State Management**: Heavily utilizes React state to track the selected class, month, year, selected students for bulk actions, and the currently active student for real-time summary display.
- **Roster Loading & Normalization**:
  - Fetches student lists from class-specific sheets (e.g., `Class1`, `Class2`).
  - Auto-removes duplicate entries based on `RollNumber` and normalizes class strings (e.g., stripping the word "class").
- **Grid Generation**:
  - Dynamically calculates the exact number of days in the selected month/year.
  - Identifies Sundays mathematically and pre-marks them as `H` (Holiday) in red.
  - Overlays existing saved attendance data for that month.
- **Interactions & Bulk Editing**:
  - Individual cells cycle through states: `P` (Present) &rarr; `A` (Absent) &rarr; `H` (Holiday) &rarr; `P`.
  - Enables users to check multiple students and apply bulk column (day) changes exclusively to selected students.
- **Saving Logic**:
  - Compiles a JSON payload mapping days (1-31) to statuses.
  - The backend script updates *only* the submitted students' rows for that specific month, keeping other students' records intact.
- **Student Management**: Features a dialog to append a new student to the master Google Sheet, which instantly pushes them into the local UI state.

#### Student View (`src/pages/Attendance.tsx`)
- **Lookup Requirements**: Requires students to input both `RollNumber` and `Class`.
- **Data Aggregation**:
  - Iterates through all monthly records returned for the specified student.
  - Calculates working days (Total Days - Holidays) and overarching attendance percentages.
- **UI Feedback**:
  - Displays a dynamic progress bar mapped by percentage: Green (&ge;75%), Yellow (50-74%), and Red (&lt;50%).
  - Prompts a distinct alert warning if attendance falls below the 75% baseline threshold.

### 2. Notices & Announcements

#### Public View (`src/components/AnnouncementsSection.tsx`)
- **Lazy Loading**: Leverages the `IntersectionObserver` API to delay fetching notices until the user scrolls near the section, substantially optimizing the initial payload.
- **Auto-Tagging Engine**: Scans text in titles and descriptions for specific keywords (e.g., "diwali", "test", "routine") to auto-assign categorizations (`holiday`, `exam`, `timetable`).
- **Rich Data Rendering**:
  - Parses descriptions using `---` delimiters to render embedded HTML tables—highly useful for clean formatting of timetables and exam schedules.
  - Calculates dates to spot notices posted within the last 7 days, decorating them with an animated "New" badge.
- **Caching Strategy**: Caches fetched data in `sessionStorage` (`NOTICES_CACHE_KEY`) for 30 minutes to reduce network calls while users navigate the application.

#### Admin Publishing (`src/components/NoticesForm.tsx`)
- **Dynamic Forms**: Embeds a specialized form builder when `timetable` or `exam` is selected, allowing admins to add/remove specific table rows (Subject, Date, Time, Room).
- **Data Formatting**: Automatically compiles those dynamic rows into structured strings so the frontend `AnnouncementsSection` parsing engine can construct the actual tables.
- **Management Features**: 
  - Maintains a separate 1-hour admin cache (`adminNoticesCache`).
  - Facilitates deleting specific notices by computing the actual target row index and dispatching it to the Apps Script.

### 3. Student Data Management (`src/components/StudentDataTab.tsx`)
- **Caching Strategy**: Leverages a `studentDataCache` with a 1-hour expiry to guarantee instantaneous loads when admins swap context tabs.
- **Analytics & Summaries**: Automatically processes raw roster data to display the total student count alongside a dynamic, per-class statistical breakdown.
- **Advanced Filtering**:
  - Unifies a class-based dropdown filter with a global fuzzy text search matching any field (Name, Roll No., Phone).
  - Utilizes a hidden `_originalIndex` reference when filtering. This critical mapping ensures admins can delete specific filtered rows from the backend accurately.

### 4. Lead Generation / Inquiry (`src/components/StudentInfoPopup.tsx`)
- **Trigger Behavior**: Initiates a background timer that displays the lead capture modal exactly 2 seconds after page load.
- **Session Management**: Asserts a `student_popup_shown` token into `sessionStorage` ensuring the prompt only displays once per user session.
- **Submission Flow**: Posts `studentName`, `fatherName`, `phone`, and `class` as form-urlencoded properties strictly to the Google Sheet.

## Backend Architecture (Google Apps Script)

- **Primary API Endpoint**: `https://script.google.com/macros/s/AKfycbykrBuCFBkSBaQdc_IIPlbvt77KKnwy8SJ01ICcrX9DDMMu3Eqe3WavYOX4drZAYt-wpA/exec`
- **Data Source**: Tightly bound to Google Sheet ID `1GVib7J0OISpTbW1ovyL_xSNX_NQPKS3Q6Zi6VsGOoFY`.
- **Routing Paradigm**: Extracts query and form parameters (`action`, `sheet`) using the `doPost(e)` and `doGet(e)` native handlers to simulate a full REST API.
  - **POST Actions**: Supports mutations like `saveAttendance`, `addStudent`, `delete`, and unstructured inserts via `sheet=Sheet2` for announcements.
  - **GET Actions**: Retrieves data utilizing `getMonthAttendance`, `getStudentAttendance`, `getMarks`, `getStudentsByClass`.
- **CORS Handling Considerations**: Frontend mutations (`POST`) are dispatched exclusively with `mode: "no-cors"`. Consequently, the frontend cannot parse a traditional JSON response to validate the HTTP state, and relies instead on successful code execution paths or subsequent polling routines.



  - **POST Actions**: Supports mutations like `saveAttendance`, `addStudent`, `delete`, and unstructured inserts via `sheet=Sheet2` for announcements.
  - **GET Actions**: Retrieves data utilizing `getMonthAttendance`, `getStudentAttendance`, `getMarks`, `getStudentsByClass`.
- **CORS Handling Considerations**: Frontend mutations (`POST`) are dispatched exclusively with `mode: "no-cors"`. Consequently, the frontend cannot parse a traditional JSON response to validate the HTTP state, and relies instead on successful code execution paths or subsequent polling routines.

## Component & Function Reference

Below is an exhaustive list of the functions and methods defined within the application's React components, categorized by file.

### `src/components/AttendanceTab.tsx`
*   `getDaysInMonth(month: number, year: number)`: Calculates the exact number of days in a given month.
*   `isSunday(year: number, month: number, day: number)`: Checks if a specific date falls on a Sunday.
*   `nextStatus(current: AttendanceStatus)`: Cycles the attendance status string (`P` &rarr; `A` &rarr; `H` &rarr; `P`).
*   `normalizeAttendanceStatus(value: unknown)`: Sanitizes raw status values to ensure they strictly match `P`, `A`, `H`, or `""`.
*   `buildDefaultDays(monthName: string, yearValue: string)`: Generates a baseline 31-day status array, marking valid days as `P` and mathematically calculated Sundays as `H`.
*   `normalizeClassValue(value: unknown)`: Cleans class strings by stripping the word "class" and trimming whitespace.
*   `parseStudentList(rows: unknown, selectedClass: string)`: Processes raw Google Sheet rows, filtering for the selected class and removing duplicate entries based on Roll Number or Name.
*   `getStudentKey(row)`: Generates a unique identifier for a student row, prioritizing Roll Number over Student Name.
*   `AttendanceTab()`: The main React functional component.
*   `handleAddStudent()`: Submits the "Add New Student" form data to the backend and pushes the new student into local state.
*   `loadAttendance()`: Fetches the class roster and merges any existing attendance data for the selected month/year.
*   `toggleDay(studentIdx: number, dayIdx: number)`: Toggles the attendance status for a single cell in the grid.
*   `markDayForAll(dayIdx: number, status: AttendanceStatus)`: Applies a specific status to an entire column (day), filtering by selected students if any are checked.
*   `toggleStudentSelection(studentKey: string, checked: boolean)`: Updates the selection state for an individual student checkbox.
*   `toggleAllStudents(checked: boolean)`: Checks or unchecks all loaded students simultaneously.
*   `saveAttendance()`: Compiles the modified attendance grid into a JSON payload and dispatches it to the Apps Script backend.

### `src/pages/Attendance.tsx`
*   `getStatusIcon(status: string)`: Returns the appropriate Lucide React icon component based on the status (CheckCircle, XCircle, or Clock).
*   `getStatusBadge(status: string)`: Returns the specific Tailwind CSS color classes for a status badge.
*   `Attendance()`: The main React functional component.
*   `handleSearch()`: Validates inputs, fetches a student's entire attendance history from the backend, and calculates overall working days/percentages.

### `src/components/AnnouncementsSection.tsx`
*   `detectTag(notice: Notice)`: Auto-categorizes a notice as `holiday`, `timetable`, `exam`, or `general` by scanning its text for contextual keywords.
*   `isWithinLastWeek(dateStr: string)`: Parses string dates and determines if the notice was posted within the last 7 days.
*   `renderDescription(description: string, tag: TagType)`: Custom markdown parser that splits text using `---` delimiters and renders valid delimited text as styled HTML `<table>` elements.
*   `AnnouncementsSection()`: The main React functional component.
*   `fetchNotices()`: Calls the backend to retrieve announcements and caches them in `sessionStorage`.

### `src/components/NoticesForm.tsx`
*   `loadCachedNotices()`: Retrieves and validates the 1-hour expiration limit on cached admin notices.
*   `NoticesForm()`: The main React functional component.
*   `fetchNotices()`: Fetches existing notices to populate the management list.
*   `handleDeleteNotice(index: number)`: Calculates the Google Sheet row offset and dispatches a deletion request.
*   `addRow()`: Appends an empty row object to the dynamic timetable/exam builder state.
*   `removeRow(i: number)`: Slices out a specific row from the dynamic timetable/exam builder.
*   `updateRow(i: number, field: keyof TimetableRow, value: string)`: Updates the value for a specific field within the dynamic builder.
*   `buildTableDescription()`: Compiles the dynamic React inputs into the pipe-delimited string format required by the `AnnouncementsSection` frontend parser.
*   `handleSubmit(e: React.FormEvent)`: Formats the note and table strings, then posts the final compiled notice to the backend.

### `src/components/StudentDataTab.tsx`
*   `loadCache()`: Safely retrieves and validates student records from the `sessionStorage` cache.
*   `StudentDataTab()`: The main React functional component.
*   `fetchStudents()`: Fetches the master student database from `Sheet1`.
*   `handleDeleteStudent(originalIndex: number)`: Requests deletion of a specific student, mapping the filtered UI index back to the absolute array index required by the backend.

### `src/components/StudentInfoPopup.tsx`
*   `StudentInfoPopup()`: The main React functional component.
*   `handleChange(field: string, value: string)`: Generic state updater for the inquiry form inputs.
*   `handleSubmit(e: React.FormEvent)`: Posts the inquiry payload to the backend as `application/x-www-form-urlencoded` data.
