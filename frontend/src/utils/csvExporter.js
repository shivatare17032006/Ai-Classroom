// Gradebook CSV Exporter Utility

export function exportGradebookToCSV(submissions, assignments, users, extensions, filename = 'AI_Classroom_Gradebook.csv') {
  const headers = [
    'Student Name',
    'Student Email',
    'Assignment Title',
    'AI Suggested Score',
    'Teacher Final Score',
    'Maximum Marks',
    'Minimum Threshold',
    'Similarity %',
    'Status',
    'Plagiarism Status',
    'Submission Date',
    'Extended Deadline'
  ];

  const rows = [];

  // Find all student users
  const students = users.filter(u => u.role === 'STUDENT');

  assignments.forEach(asg => {
    students.forEach(student => {
      const sub = submissions.find(s => s.assignmentId === asg.id && s.studentId === student.id);
      const ext = extensions.find(e => e.assignmentId === asg.id && e.studentId === student.id);

      let status = 'Missing';
      let aiScore = '--';
      let finalScore = '--';
      let similarity = '--';
      let plagStatus = 'N/A';
      let subDate = '--';
      let extendedDue = ext ? new Date(ext.extendedDueDate).toLocaleDateString() : 'None';

      if (sub) {
        aiScore = sub.aiSuggestedGrade !== null ? sub.aiSuggestedGrade : '--';
        finalScore = sub.teacherFinalGrade !== null ? sub.teacherFinalGrade : '--';
        similarity = sub.similarityPercentage + '%';
        plagStatus = sub.plagiarismStatus;
        subDate = new Date(sub.submittedAt).toLocaleString();

        if (sub.status === 'REJECTED_PLAGIARISM') {
          status = 'Flagged (Plagiarism)';
        } else if (sub.isBelowThreshold) {
          status = 'Flagged (Below Threshold)';
        } else if (sub.status === 'FINALIZED') {
          status = 'Pass';
        } else {
          status = 'Pending Review';
        }
      }

      rows.push([
        `"${student.name}"`,
        `"${student.email}"`,
        `"${asg.title}"`,
        aiScore,
        finalScore,
        asg.maximumMarks,
        asg.minimumThreshold,
        `"${similarity}"`,
        `"${status}"`,
        `"${plagStatus}"`,
        `"${subDate}"`,
        `"${extendedDue}"`
      ]);
    });
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  // Trigger File Download in Browser
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
