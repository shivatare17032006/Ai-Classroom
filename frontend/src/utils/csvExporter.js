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

  const students = safeUsers.filter(u => u && (!u.role || u.role === 'STUDENT'));

  const getLatestSub = (asgId, student) => {
    const matched = safeSubmissions.filter(s => 
      s && s.assignmentId === asgId && 
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
        finalMarks = `${grade} / ${assignment.maximumMarks || 10}`;
      } else {
        finalMarks = 'Submitted (Ungraded)';
      }

      subDate = sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'Submitted';
    }

    return [
      `"${(student.name || '').replace(/"/g, '""')}"`,
      `"${(student.email || '').replace(/"/g, '""')}"`,
      `"${(student.rollNo || 'N/A').replace(/"/g, '""')}"`,
      `"${(student.prnNo || 'N/A').replace(/"/g, '""')}"`,
      `"${finalMarks.replace(/"/g, '""')}"`,
      `"${subDate.replace(/"/g, '""')}"`
    ];
  });

  const titleClean = (assignment.title || 'Assignment').replace(/[^a-zA-Z0-9]/g, '_');
  downloadCSV([headers.join(','), ...rows.map(r => r.join(','))].join('\n'), filename || `${titleClean}_Gradebook.csv`);
}

/**
 * 2. Exports Master Course Matrix CSV (All Enrolled Students x All Course Assignments)
 * Required Columns: Student Name, Student Email, Roll No, PRN No, [Assignment 1 Marks], [Assignment 2 Marks]..., Overall Class Average, Completed Submissions
 */
export function exportMasterCourseMatrixCSV(assignments, submissions, users, classroomName = 'Course', filename) {
  const safeAssignments = assignments || [];
  const safeSubmissions = submissions || [];
  const safeUsers = users || [];

  const students = safeUsers.filter(u => u && (!u.role || u.role === 'STUDENT'));

  const getLatestSub = (asgId, student) => {
    const matched = safeSubmissions.filter(s => 
      s && s.assignmentId === asgId && 
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
    ...safeAssignments.map(a => `"${(a.title || 'Assignment').replace(/"/g, '""')} (Max: ${a.maximumMarks || 10})"`),
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
          return `"${grade} / ${asg.maximumMarks || 10}"`;
        }
        return '"Submitted"';
      }
      return '"MISSING"';
    });

    const avgScore = gradedCount > 0 ? (studentTotalScore / gradedCount).toFixed(1) : 'N/A';
    const completionRatio = `${submissionsDone} / ${safeAssignments.length}`;

    return [
      `"${(student.name || '').replace(/"/g, '""')}"`,
      `"${(student.email || '').replace(/"/g, '""')}"`,
      `"${(student.rollNo || 'N/A').replace(/"/g, '""')}"`,
      `"${(student.prnNo || 'N/A').replace(/"/g, '""')}"`,
      ...assignmentScores,
      avgScore,
      `"${completionRatio}"`
    ];
  });

  const courseClean = (classroomName || 'Course').replace(/[^a-zA-Z0-9]/g, '_');
  downloadCSV([headers.join(','), ...rows.map(r => r.join(','))].join('\n'), filename || `${courseClean}_Master_Gradebook_Matrix.csv`);
}

/**
 * 3. General Gradebook Exporter
 */
export function exportGradebookToCSV(submissions, assignments, users, extensions, filename = 'AI_Classroom_Gradebook.csv') {
  exportMasterCourseMatrixCSV(assignments, submissions, users, 'Class', filename);
}

/**
 * 4. Exports Sample Parent Email & Student Credentials CSV Template
 */
export function exportParentEmailRosterTemplateCSV(enrolledStudents = [], classroomName = 'Course') {
  const headers = ['Roll No', 'PRN No', 'Student Email', 'Student Name', 'Parent Email'];
  
  let rows = [];
  if (enrolledStudents && enrolledStudents.length > 0) {
    rows = enrolledStudents.map(student => [
      `"${student.rollNo || ''}"`,
      `"${student.prnNo || ''}"`,
      `"${student.email || ''}"`,
      `"${student.name || ''}"`,
      `"${student.parentEmail || ''}"`
    ]);
  } else {
    rows = [
      ['"2201045"', '"122B1B045"', '"student1@domain.edu"', '"Rahul Sharma"', '"parent.rahul@gmail.com"'],
      ['"2201046"', '"122B1B046"', '"student2@domain.edu"', '"Priya Patel"', '"parent.priya@gmail.com"']
    ];
  }

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadCSV(csvContent, `${classroomName.replace(/[^a-zA-Z0-9]/g, '_')}_Parent_Email_Roster_Template.csv`);
}

/**
 * 5. Parses Bulk CSV File for Parent Email & Student Credentials Updates
 */
export function parseParentEmailCSV(csvText) {
  if (!csvText || !csvText.trim()) return [];

  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];

  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  };

  const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  
  const emailIdx = headers.findIndex(h => (h.includes('student') && h.includes('email')) || (h.includes('email') && !h.includes('parent')));
  const parentEmailIdx = headers.findIndex(h => h.includes('parent'));
  const rollIdx = headers.findIndex(h => h.includes('roll'));
  const prnIdx = headers.findIndex(h => h.includes('prn'));
  const nameIdx = headers.findIndex(h => h.includes('name'));

  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    if (cols.length === 0) continue;

    const studentEmail = emailIdx !== -1 ? cols[emailIdx] : '';
    const parentEmail = parentEmailIdx !== -1 ? cols[parentEmailIdx] : (cols[cols.length - 1] || '');
    const rollNo = rollIdx !== -1 ? cols[rollIdx] : '';
    const prnNo = prnIdx !== -1 ? cols[prnIdx] : '';
    const name = nameIdx !== -1 ? cols[nameIdx] : '';

    if (studentEmail || parentEmail || rollNo || prnNo) {
      records.push({ studentEmail, parentEmail, rollNo, prnNo, name });
    }
  }

  return records;
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


