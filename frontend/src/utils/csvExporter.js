// Gradebook CSV Exporter Utility

/**
 * 1. Exports CSV for a Single Assignment
 * Required Columns: Student Name, Student Email, Roll No, PRN No, Teacher Finalized Marks, Date Submitted
 */
export function exportSingleAssignmentCSV(assignment, submissions, users, extensions, filename) {
  if (!assignment) return;
  const safeSubmissions = submissions || [];
  const safeUsers = users || [];

  const headers = [
    'Student Name',
    'Student Email',
    'Roll No',
    'PRN No',
    'Teacher Finalized Marks',
    'Date Submitted'
  ];

  const students = safeUsers.filter(u => u.role === 'STUDENT');

  const getLatestSub = (asgId, student) => {
    const matched = safeSubmissions.filter(s => 
      s.assignmentId === asgId && 
      (s.studentId === student.id || 
       (student.email && s.studentId && s.studentId.toLowerCase() === student.email.toLowerCase()) ||
       (student.email && s.studentEmail && s.studentEmail.toLowerCase() === student.email.toLowerCase()))
    );
    if (matched.length === 0) return null;
    matched.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
    return matched[0];
  };

  const rows = students.map(student => {
    const sub = getLatestSub(assignment.id, student);

    let finalMarks = 'MISSING';
    let subDate = 'MISSING';

    if (sub) {
      const grade = (sub.teacherFinalGrade !== null && sub.teacherFinalGrade !== undefined) 
        ? sub.teacherFinalGrade 
        : sub.aiSuggestedGrade;

      if (grade !== null && grade !== undefined) {
        finalMarks = `${grade} / ${assignment.maximumMarks}`;
      } else {
        finalMarks = 'Submitted (Ungraded)';
      }

      subDate = sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'Submitted';
    }

    return [
      `"${student.name}"`,
      `"${student.email}"`,
      `"${student.rollNo || 'N/A'}"`,
      `"${student.prnNo || 'N/A'}"`,
      `"${finalMarks}"`,
      `"${subDate}"`
    ];
  });

  downloadCSV([headers.join(','), ...rows.map(r => r.join(','))].join('\n'), filename || `${assignment.title.replace(/[^a-zA-Z0-9]/g, '_')}_Gradebook.csv`);
}

/**
 * 2. Exports Master Course Matrix CSV (All Enrolled Students x All Course Assignments)
 * Required Columns: Student Name, Student Email, Roll No, PRN No, [Assignment 1 Marks], [Assignment 2 Marks]..., Overall Class Average, Completed Submissions
 */
export function exportMasterCourseMatrixCSV(assignments, submissions, users, classroomName = 'Course', filename) {
  const safeAssignments = assignments || [];
  const safeSubmissions = submissions || [];
  const safeUsers = users || [];

  const students = safeUsers.filter(u => u.role === 'STUDENT');

  const getLatestSub = (asgId, student) => {
    const matched = safeSubmissions.filter(s => 
      s.assignmentId === asgId && 
      (s.studentId === student.id || 
       (student.email && s.studentId && s.studentId.toLowerCase() === student.email.toLowerCase()) ||
       (student.email && s.studentEmail && s.studentEmail.toLowerCase() === student.email.toLowerCase()))
    );
    if (matched.length === 0) return null;
    matched.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
    return matched[0];
  };

  const headers = [
    'Student Name',
    'Student Email',
    'Roll No',
    'PRN No',
    ...safeAssignments.map(a => `"${a.title.replace(/"/g, '""')} (Max: ${a.maximumMarks})"`),
    'Overall Class Average',
    'Completed Submissions'
  ];

  const rows = students.map(student => {
    let studentTotalScore = 0;
    let gradedCount = 0;
    let submissionsDone = 0;

    const assignmentScores = safeAssignments.map(asg => {
      const sub = getLatestSub(asg.id, student);
      if (sub) {
        submissionsDone++;
        const grade = (sub.teacherFinalGrade !== null && sub.teacherFinalGrade !== undefined) 
          ? sub.teacherFinalGrade 
          : sub.aiSuggestedGrade;

        if (grade !== null && grade !== undefined) {
          studentTotalScore += grade;
          gradedCount++;
          return `"${grade} / ${asg.maximumMarks}"`;
        }
        return '"Submitted"';
      }
      return '"MISSING"';
    });

    const avgScore = gradedCount > 0 ? (studentTotalScore / gradedCount).toFixed(1) : 'N/A';
    const completionRatio = `${submissionsDone} / ${safeAssignments.length}`;

    return [
      `"${student.name}"`,
      `"${student.email}"`,
      `"${student.rollNo || 'N/A'}"`,
      `"${student.prnNo || 'N/A'}"`,
      ...assignmentScores,
      avgScore,
      `"${completionRatio}"`
    ];
  });

  downloadCSV([headers.join(','), ...rows.map(r => r.join(','))].join('\n'), filename || `${classroomName.replace(/[^a-zA-Z0-9]/g, '_')}_Master_Gradebook_Matrix.csv`);
}

/**
 * 3. General Gradebook Exporter
 */
export function exportGradebookToCSV(submissions, assignments, users, extensions, filename = 'AI_Classroom_Gradebook.csv') {
  exportMasterCourseMatrixCSV(assignments, submissions, users, 'Class', filename);
}

function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


