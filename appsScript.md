# Apps Script

Copy and paste this full code into your Google Apps Script project when you want to update the backend.

```javascript
const SHEET_ID = "1GVib7J0OISpTbW1ovyL_xSNX_NQPKS3Q6Zi6VsGOoFY";

/*
  Main POST handler.
  Handles:
  1. Saving results
  2. Deleting rows
  3. Adding students
  4. Saving attendance
  5. Posting notices
  6. Saving student inquiries
*/
function doPost(e) {
  try {
    if (!e || !e.parameter) {
      return jsonResponse({ error: "No data received" });
    }

    const params = e.parameter;
    const ss = SpreadsheetApp.openById(SHEET_ID);

    /*
      Save student results.
      Sheet names supported:
      Results_Class1
      Results_Class2
      Results_ClassLKG
      Results_ClassUKG
      Results_ClassPREKG
    */
    if (
      params.sheet &&
      /^Results_Class(PREKG|LKG|UKG|\d+)$/.test(params.sheet) &&
      params.RollNumber &&
      params.ExamType
    ) {
      var resultsSheetName = params.sheet;
      var resultsSheet = ss.getSheetByName(resultsSheetName);

      // Create the result sheet if it does not exist yet.
      if (!resultsSheet) {
        resultsSheet = ss.insertSheet(resultsSheetName);
        resultsSheet.appendRow([
          "RollNumber",
          "StudentName",
          "Class",
          "ExamType",
          "Telugu",
          "Hindi",
          "English",
          "Maths",
          "Science",
          "Social",
          "Total",
          "Percentage",
          "Grade",
          "Result",
          "Date"
        ]);
      }

      var resultValues = resultsSheet.getDataRange().getValues();
      var resultTargetRow = -1;

      // If same student + class + exam already exists, update that row.
      for (var i = 1; i < resultValues.length; i++) {
        if (
          String(resultValues[i][0] || "").trim() === String(params.RollNumber || "").trim() &&
          String(resultValues[i][2] || "").trim() === String(params.Class || "").trim() &&
          String(resultValues[i][3] || "").trim() === String(params.ExamType || "").trim()
        ) {
          resultTargetRow = i + 1;
          break;
        }
      }

      var resultRow = [
        params.RollNumber || "",
        params.StudentName || "",
        params.Class || "",
        params.ExamType || "",
        params.Telugu || "",
        params.Hindi || "",
        params.English || "",
        params.Maths || "",
        params.Science || "",
        params.Social || "",
        params.Total || "",
        params.Percentage || "",
        params.Grade || "",
        params.Result || "",
        params.Date || new Date().toLocaleDateString("en-IN")
      ];

      if (resultTargetRow > 0) {
        resultsSheet.getRange(resultTargetRow, 1, 1, resultRow.length).setValues([resultRow]);
      } else {
        resultsSheet.appendRow(resultRow);
      }

      return jsonResponse({ success: true });
    }

    /*
      Delete a row from any target sheet.
      Used by admin dashboard delete buttons.
    */
    if (params.action === "delete") {
      const deleteSheetName = params.sheet || "Sheet1";
      const row = parseInt(params.row, 10);
      const deleteSheet = ss.getSheetByName(deleteSheetName);

      if (!deleteSheet || isNaN(row) || row < 2) {
        return jsonResponse({ error: "Invalid sheet or row" });
      }

      deleteSheet.deleteRow(row);
      return jsonResponse({ success: true });
    }

    /*
      Add a new student to the master student list.
      Students are stored in Sheet1.
    */
    if (params.action === "addStudent") {
      const studentSheet = ss.getSheetByName("Sheet1");
      if (!studentSheet) throw new Error("Sheet1 not found");

      studentSheet.appendRow([
        params.StudentName || params.studentName || "",
        params.RollNumber || params.rollNumber || "",
        params.Class || params.class || "",
        new Date()
      ]);

      return jsonResponse({ success: true });
    }

    /*
      Save student inquiry popup submissions.
      This creates a StudentEnqury sheet if it does not exist.
    */
    if (params.action === "studentInquiry") {
      var inquirySheetName = "StudentEnqury";
      var inquirySheet = ss.getSheetByName(inquirySheetName);

      if (!inquirySheet) {
        inquirySheet = ss.insertSheet(inquirySheetName);
        inquirySheet.appendRow([
          "StudentName",
          "FatherName",
          "Phone",
          "Class",
          "Timestamp"
        ]);
      }

      inquirySheet.appendRow([
        params.studentName || "",
        params.fatherName || "",
        params.phone || "",
        params.class || "",
        params.timestamp || formatInquiryTimestamp()
      ]);

      return jsonResponse({ success: true });
    }

    /*
      Save attendance for a class + month + year.
      Attendance sheets:
      Attendance_Class1
      Attendance_Class2
      Attendance_ClassLKG
      Attendance_ClassUKG
      Attendance_ClassPREKG
    */
    if (params.action === "saveAttendance") {
      var studentClass = String(params.class || "").trim();
      var month = String(params.month || "").trim();
      var year = String(params.year || "").trim();

      var data = [];
      try {
        data = JSON.parse(params.data || "[]");
      } catch (err) {
        return jsonResponse({ error: "Invalid JSON data" });
      }

      var attendanceSheetName = "Attendance_Class" + studentClass;
      var attendanceSheet = ss.getSheetByName(attendanceSheetName);

      // Create attendance sheet if missing.
      if (!attendanceSheet) {
        attendanceSheet = ss.insertSheet(attendanceSheetName);
        attendanceSheet.appendRow([
          "StudentName", "RollNumber", "Class", "Month", "YY",
          "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
          "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
          "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"
        ]);
      }

      var existing = attendanceSheet.getDataRange().getValues();

      for (var r = 0; r < data.length; r++) {
        var student = data[r];
        var attendanceTargetRow = -1;

        // Find existing row for same student + class + month + year.
        for (var x = 1; x < existing.length; x++) {
          if (
            String(existing[x][1] || "").trim() === String(student.RollNumber || "").trim() &&
            String(existing[x][2] || "").trim() === studentClass &&
            String(existing[x][3] || "").trim() === month &&
            String(existing[x][4] || "").trim() === year
          ) {
            attendanceTargetRow = x + 1;
            break;
          }
        }

        var attendanceRow = [
          student.StudentName || "",
          student.RollNumber || "",
          student.Class || "",
          month,
          year
        ];

        // Add days 1 to 31.
        for (var d = 1; d <= 31; d++) {
          var padded = String(d).padStart(2, "0");
          var normal = String(d);
          attendanceRow.push(student[padded] || student[normal] || "");
        }

        if (attendanceTargetRow > 0) {
          attendanceSheet.getRange(attendanceTargetRow, 1, 1, attendanceRow.length).setValues([attendanceRow]);
          existing[attendanceTargetRow - 1] = attendanceRow;
        } else {
          attendanceSheet.appendRow(attendanceRow);
          existing.push(attendanceRow);
        }
      }

      return jsonResponse({ success: true });
    }

    /*
      Save a notice to Sheet2.
      Used by notices/admin announcements.
    */
    if (params.sheet === "Sheet2") {
      const noticeSheet = ss.getSheetByName("Sheet2");
      if (!noticeSheet) throw new Error("Sheet2 not found");

      noticeSheet.appendRow([
        params.title || "",
        params.description || "",
        params.tag || "",
        params.postedBy || "Admin",
        params.date || new Date().toLocaleDateString("en-IN")
      ]);

      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: "Invalid action" });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

/*
  Main GET handler.
  Handles:
  1. Getting students by class
  2. Getting student marks
  3. Getting student attendance
  4. Getting attendance for a month
  5. Generic sheet read
*/
function doGet(e) {
  try {
    if (!e || !e.parameter) {
      return jsonResponse([]);
    }

    var action = e.parameter.action;
    var ss = SpreadsheetApp.openById(SHEET_ID);

    /*
      Return students from Sheet1 for a given class.
    */
    if (action === "getStudentsByClass") {
      var studentSheet = ss.getSheetByName("Sheet1");
      if (!studentSheet) return jsonResponse([]);

      var data = studentSheet.getDataRange().getValues();
      var headers = data[0];
      var results = [];
      var requestedClass = normalizeClassValue(e.parameter.class || "");

      for (var i = 1; i < data.length; i++) {
        if (data[i].join("") === "") continue;

        var obj = {};
        for (var j = 0; j < headers.length; j++) {
          obj[String(headers[j] || "").trim()] = data[i][j];
        }

        var rowClass = normalizeClassValue(obj["Class"] || obj["class"] || "");
        if (rowClass === requestedClass) {
          results.push(obj);
        }
      }

      return jsonResponse(results);
    }

    /*
      Return student marks from Results_Class...
    */
    if (action === "getMarks") {
      var classValue = String(e.parameter.class || "").trim();
      var rollValue = String(e.parameter.rollNumber || "").trim();

      if (!classValue || !rollValue) {
        return jsonResponse({ error: "Missing class or roll number" });
      }

      var marksSheetName = "Results_Class" + classValue;
      var marksSheet = ss.getSheetByName(marksSheetName);

      if (!marksSheet) {
        return jsonResponse({ error: "Sheet not found: " + marksSheetName });
      }

      return filterData(marksSheet, rollValue, classValue);
    }

    /*
      Return all attendance rows for a student from Attendance_Class...
      This is used by the student attendance page.
    */
    if (action === "getStudentAttendance") {
      var attendanceClassValue = String(e.parameter.class || "").trim();
      var attendanceRollValue = String(e.parameter.rollNumber || "").trim();
      var attendanceSheetName = "Attendance_Class" + attendanceClassValue;
      var attendanceSheet = ss.getSheetByName(attendanceSheetName);

      if (!attendanceClassValue || !attendanceRollValue) {
        return jsonResponse({ error: "Missing class or roll number" });
      }

      if (!attendanceSheet) {
        return jsonResponse({ error: "Sheet not found: " + attendanceSheetName });
      }

      return filterData(attendanceSheet, attendanceRollValue, attendanceClassValue);
    }

    /*
      Return attendance rows for one class + month + year.
      This is used by the admin attendance screen.
    */
    if (action === "getMonthAttendance") {
      var monthClassValue = String(e.parameter.class || "").trim();
      var monthValue = String(e.parameter.month || "").trim();
      var yearValue = String(e.parameter.year || "").trim();
      var monthSheetName = "Attendance_Class" + monthClassValue;
      var monthSheet = ss.getSheetByName(monthSheetName);

      if (!monthClassValue || !monthValue || !yearValue) {
        return jsonResponse({ error: "Missing class, month, or year" });
      }

      if (!monthSheet) {
        return jsonResponse({ error: "Sheet not found: " + monthSheetName });
      }

      var data2 = monthSheet.getDataRange().getValues();
      if (!data2 || data2.length < 2) return jsonResponse([]);

      var headers2 = data2[0];
      var monthResults = [];

      for (var k = 1; k < data2.length; k++) {
        if (data2[k].join("") === "") continue;

        var obj2 = {};
        for (var m = 0; m < headers2.length; m++) {
          obj2[String(headers2[m] || "").trim()] = data2[k][m];
        }

        if (
          String(obj2["Class"] || "").trim() === monthClassValue &&
          String(obj2["Month"] || "").trim() === monthValue &&
          String(obj2["YY"] || "").trim() === yearValue
        ) {
          monthResults.push(obj2);
        }
      }

      return jsonResponse(monthResults);
    }

    /*
      Generic sheet reader.
      If no action is passed, this returns all rows from the requested sheet.
    */
    var sheet = ss.getSheetByName(e.parameter.sheet || "Sheet1");
    if (!sheet) return jsonResponse([]);

    var allData = sheet.getDataRange().getValues();
    var allHeaders = allData[0];
    var rows = [];

    for (var n = 1; n < allData.length; n++) {
      if (allData[n].join("") === "") continue;

      var rowObj = {};
      for (var p = 0; p < allHeaders.length; p++) {
        rowObj[String(allHeaders[p] || "").trim()] = allData[n][p];
      }

      rowObj.rowNumber = n + 1;
      rows.push(rowObj);
    }

    return jsonResponse(rows);
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

/*
  Convert any JS object/array into JSON response for Apps Script web app.
*/
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/*
  Build enquiry timestamp only up to minutes.
  Example: 2026-03-30 08:31
*/
function formatInquiryTimestamp() {
  var now = new Date();
  var year = now.getFullYear();
  var month = String(now.getMonth() + 1).padStart(2, "0");
  var day = String(now.getDate()).padStart(2, "0");
  var hours = String(now.getHours()).padStart(2, "0");
  var minutes = String(now.getMinutes()).padStart(2, "0");
  return year + "-" + month + "-" + day + " " + hours + ":" + minutes;
}

/*
  Reusable helper:
  Filters a sheet by RollNumber + Class.
  Used for marks and student attendance lookups.
*/
function filterData(sheet, rollNumber, studentClass) {
  var data = sheet.getDataRange().getValues();
  if (!data || data.length < 2) return jsonResponse([]);

  var headers = data[0];
  var results = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i].join("") === "") continue;

    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var key = String(headers[j] || "").trim();
      obj[key] = data[i][j];
    }

    var rowRoll = String(obj["RollNumber"] || "").trim();
    var rowClass = String(obj["Class"] || "").trim();

    if (
      rowRoll === String(rollNumber || "").trim() &&
      rowClass === String(studentClass || "").trim()
    ) {
      results.push(obj);
    }
  }

  return jsonResponse(results);
}

/*
  Normalize class values so these all match correctly:
  "1", "Class 1", "class 1"
  "LKG", "lkg"
*/
function normalizeClassValue(value) {
  return String(value || "")
    .replace(/class/gi, "")
    .trim()
    .toUpperCase();
}
```
