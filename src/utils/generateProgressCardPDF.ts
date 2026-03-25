import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ResultRow {
  RollNumber: string;
  StudentName: string;
  Class: string;
  ExamType: string;
  Telugu: number;
  Hindi: number;
  English: number;
  Maths: number;
  Science: number;
  Social: number;
  Total: number;
  Percentage: number;
  Grade: string;
}

const SCHOOL_NAME = "Sunrise Public School";
const SCHOOL_TAGLINE = "Nurturing Minds, Shaping Futures";
const SCHOOL_ADDRESS = "Sagar Nagar, Visakhapatnam, Andhra Pradesh - 530046";
const SUBJECTS = ["Telugu", "Hindi", "English", "Maths", "Science", "Social"] as const;

export const generateProgressCardPDF = (results: ResultRow[]) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const student = results[0];

  results.forEach((r, idx) => {
    if (idx > 0) doc.addPage();

    let y = 15;

    // Header border
    doc.setDrawColor(25, 80, 140);
    doc.setLineWidth(1.5);
    doc.rect(10, 10, pageWidth - 20, 277);

    // School branding band
    doc.setFillColor(25, 80, 140);
    doc.rect(10, 10, pageWidth - 20, 32, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(SCHOOL_NAME, pageWidth / 2, y + 8, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(SCHOOL_TAGLINE, pageWidth / 2, y + 16, { align: "center" });

    doc.setFontSize(8);
    doc.text(SCHOOL_ADDRESS, pageWidth / 2, y + 22, { align: "center" });

    // Title
    y = 52;
    doc.setTextColor(25, 80, 140);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("PROGRESS REPORT CARD", pageWidth / 2, y, { align: "center" });

    // Decorative line
    y += 4;
    doc.setDrawColor(25, 80, 140);
    doc.setLineWidth(0.8);
    doc.line(60, y, pageWidth - 60, y);

    // Student details box
    y += 8;
    doc.setFillColor(240, 245, 255);
    doc.roundedRect(20, y, pageWidth - 40, 28, 3, 3, "F");

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    const leftX = 28;
    const rightX = pageWidth / 2 + 10;
    const detailY = y + 8;

    doc.text("Student Name:", leftX, detailY);
    doc.setFont("helvetica", "normal");
    doc.text(student.StudentName, leftX + 32, detailY);

    doc.setFont("helvetica", "bold");
    doc.text("Roll Number:", rightX, detailY);
    doc.setFont("helvetica", "normal");
    doc.text(String(student.RollNumber), rightX + 28, detailY);

    doc.setFont("helvetica", "bold");
    doc.text("Class:", leftX, detailY + 10);
    doc.setFont("helvetica", "normal");
    doc.text(String(student.Class), leftX + 14, detailY + 10);

    doc.setFont("helvetica", "bold");
    doc.text("Examination:", rightX, detailY + 10);
    doc.setFont("helvetica", "normal");
    doc.text(r.ExamType || "Exam", rightX + 28, detailY + 10);

    // Marks table
    y += 38;
    const tableBody = SUBJECTS.map((sub, i) => [
      String(i + 1),
      sub,
      String(r[sub]),
      "100",
      Number(r[sub]) >= 35 ? "Pass" : "Fail",
    ]);

    autoTable(doc, {
      startY: y,
      head: [["S.No", "Subject", "Marks Obtained", "Max Marks", "Status"]],
      body: tableBody,
      margin: { left: 25, right: 25 },
      theme: "grid",
      headStyles: {
        fillColor: [25, 80, 140],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
        fontSize: 10,
      },
      bodyStyles: {
        halign: "center",
        fontSize: 10,
        textColor: [40, 40, 40],
      },
      alternateRowStyles: { fillColor: [245, 248, 255] },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 40, halign: "left" },
      },
    });

    // Summary section
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFillColor(25, 80, 140);
    doc.roundedRect(25, finalY, pageWidth - 50, 30, 3, 3, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");

    const sumY = finalY + 12;
    const col1 = 40;
    const col2 = pageWidth / 2 - 10;
    const col3 = pageWidth - 65;

    doc.text(`Total: ${r.Total} / 600`, col1, sumY);
    doc.text(`Percentage: ${r.Percentage}%`, col2, sumY);
    doc.text(`Grade: ${r.Grade}`, col3, sumY);

    // Result
    const allPass = SUBJECTS.every((s) => Number(r[s]) >= 35);
    doc.setFontSize(13);
    doc.text(
      allPass ? "RESULT: PASS" : "RESULT: FAIL",
      pageWidth / 2,
      sumY + 12,
      { align: "center" }
    );

    // Footer signatures
    const sigY = finalY + 55;
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    doc.line(30, sigY, 75, sigY);
    doc.text("Class Teacher", 38, sigY + 5);

    doc.line(pageWidth - 75, sigY, pageWidth - 30, sigY);
    doc.text("Principal", pageWidth - 62, sigY + 5);

    // Footer note
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.text(
      "This is a computer-generated progress card. No signature required.",
      pageWidth / 2,
      280,
      { align: "center" }
    );
  });

  doc.save(`ProgressCard_${student.RollNumber}_Class${student.Class}.pdf`);
};
