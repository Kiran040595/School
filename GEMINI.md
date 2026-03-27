# Project Overview & Notes

This document summarizes the main project flows, with extra focus on the attendance system and the Google Apps Script backend.

## Attendance Functionality

The attendance feature has two parts:

1. Admin or teacher attendance posting in `src/components/AttendanceTab.tsx`
2. Student attendance viewing in `src/pages/Attendance.tsx`

All attendance data is served through one Google Apps Script endpoint:

`https://script.google.com/macros/s/AKfycbykrBuCFBkSBaQdc_IIPlbvt77KKnwy8SJ01ICcrX9DDMMu3Eqe3WavYOX4drZAYt-wpA/exec`

### Admin Attendance Flow (`src/components/AttendanceTab.tsx`)

Current behavior:

1. The user selects a class and clicks `Load`.
2. The app loads student rows from the class-specific sheet, for example `Class1`, `Class2`, and so on.
3. The grid stays loaded even if month or year is changed afterward.
4. Month and year are used only for:
   * showing whether attendance is already filled for that student in that month
   * overlaying saved attendance for that month when available
   * saving attendance for that month
5. The grid supports checkbox selection for students.
6. If students are selected, bulk day updates apply only to the selected students.
7. Save can send either:
   * all loaded students, if nothing is selected
   * only selected students, if one or more are checked
8. The summary cards show Present, Absent, and Holiday counts for one active student at a time, not the whole class total.

### Student Attendance Flow (`src/pages/Attendance.tsx`)

1. The student enters roll number and class.
2. The page sends `action=getStudentAttendance`.
3. The backend returns all attendance rows for that student across months.
4. The frontend shows monthly attendance plus an overall summary.

## Google Apps Script Backend

The backend uses:

`SHEET_ID = "1GVib7J0OISpTbW1ovyL_xSNX_NQPKS3Q6Zi6VsGOoFY"`

It exposes `doGet(e)` and `doPost(e)`.

### `doPost(e)` Main Operations

* `action=saveAttendance`
  Saves or updates attendance rows in the class-specific sheet.
  Important: this should update only the submitted students and must not delete other students' rows for the same month.

* `action=addStudent`
  Adds a student row to `Sheet1`.

* `action=delete`
  Deletes a row from a given sheet.

* `sheet=Sheet2`
  Adds a new announcement or notice.

### `doGet(e)` Main Operations

* `action=getMonthAttendance`
  Returns attendance rows for one class, one month, and one year.
  Used in the admin attendance screen for month status and saved-value overlay.

* `action=getStudentAttendance`
  Returns all attendance rows for one student.

* `action=getMarks`
  Returns result or marks data from the `Marks` sheet.

* `action=getStudentsByClass`
  Returns student records from `Sheet1` for a given class.
  This exists in the script, but the current admin attendance load mainly uses the class-specific attendance sheet instead.

* `?sheet=...`
  Returns all rows from the requested sheet.

## Notices & Announcements

The notices system uses `Sheet2`.

### Public Notices (`src/components/AnnouncementsSection.tsx`)

1. Fetches notices with `?sheet=Sheet2`
2. Caches data in `sessionStorage`
3. Auto-tags notice types such as holiday or exam
4. Shows notices in an accordion layout

### Admin Notices (`src/components/NoticesForm.tsx`)

1. Creates notices, holidays, and timetables
2. Deletes notice rows with `action=delete`

## Student Data Management

Handled by `src/components/StudentDataTab.tsx`.

1. Loads student data from `Sheet1`
2. Shows student counts and class breakdown
3. Supports search and class filtering
4. Allows row deletion through the Apps Script

## Student Inquiry Popup

Handled by `src/components/StudentInfoPopup.tsx`.

1. Opens automatically after page load
2. Collects student name, father name, phone, and class
3. Sends the form data to the Apps Script

## Main UI Sections

The app is a single-page landing experience with extra routed pages.

Important components:

* `Navbar.tsx`
* `HeroSection.tsx`
* `AboutSection.tsx`
* `ToppersSection.tsx`
* `FacultySection.tsx`
* `AdmissionsSection.tsx`
* `SyllabusSection.tsx`
* `GallerySection.tsx`
* `ContactSection.tsx`
* `WhatsAppButton.tsx`

## Utility Components

* `AnimatedSection.tsx`
  Handles section entrance animations.

* `NavLink.tsx`
  Wraps route links with active-state styling.
 ṣ