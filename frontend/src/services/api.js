// Mock API Service for AI-Enabled Classroom

const STORAGE_KEYS = {
  USERS: 'aicl_users',
  CLASSROOMS: 'aicl_classrooms',
  ASSIGNMENTS: 'aicl_assignments',
  EXTENSIONS: 'aicl_extensions',
  SUBMISSIONS: 'aicl_submissions',
  NOTIFICATIONS: 'aicl_notifications',
  CERTIFICATES: 'aicl_certificates',
  SYSTEM_CONFIG: 'aicl_system_config'
};

// Initial Seed Data
const INITIAL_USERS = [
  { id: 'usr-t1', name: 'Prof. Sarah Jenkins', email: 'sarah.jenkins@university.edu', role: 'TEACHER', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
  { id: 'usr-s1', name: 'Rahul Sharma', email: 'rahul.s@student.edu', role: 'STUDENT', parentEmail: 'parent.rahul@example.com', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' },
  { id: 'usr-s2', name: 'Anita Roy', email: 'anita.r@student.edu', role: 'STUDENT', parentEmail: 'parent.anita@example.com', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
  { id: 'usr-s3', name: 'David Miller', email: 'david.m@student.edu', role: 'STUDENT', parentEmail: 'parent.david@example.com', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
  { id: 'usr-s4', name: 'Priya Patel', email: 'priya.p@student.edu', role: 'STUDENT', parentEmail: 'parent.priya@example.com', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: 'usr-a1', name: 'System Admin', email: 'admin@university.edu', role: 'ADMIN', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' }
];

const INITIAL_CLASSROOMS = [
  {
    id: 'cls-101',
    name: 'CS402 - Operating Systems',
    code: 'OS-2026-X',
    description: 'Kernel Design, Process Management, and Memory Virtualization',
    teacherId: 'usr-t1',
    teacherName: 'Prof. Sarah Jenkins',
    studentIds: ['usr-s1', 'usr-s2', 'usr-s3', 'usr-s4']
  },
  {
    id: 'cls-102',
    name: 'CS305 - Database Management Systems',
    code: 'DBMS-2026-A',
    description: 'Relational Database Architecture, SQL Optimization, and ACID Transactions',
    teacherId: 'usr-t1',
    teacherName: 'Prof. Sarah Jenkins',
    studentIds: ['usr-s1', 'usr-s2', 'usr-s3', 'usr-s4']
  }
];

const INITIAL_ASSIGNMENTS = [
  {
    id: 'asg-1',
    classroomId: 'cls-101',
    title: 'Operating Systems Assignment 1',
    description: 'Implement a Process Scheduler simulation in Java/C++ with Round Robin and Shortest Remaining Time First algorithm.',
    maximumMarks: 10,
    minimumThreshold: 5,
    similarityThreshold: 15, // 15%
    dueDate: '2026-09-20T23:59:00',
    rubric: [
      { id: 'r1', criteria: 'Understanding', weightPct: 30, maxScore: 3, description: 'Grasping CPU scheduling principles' },
      { id: 'r2', criteria: 'Correctness', weightPct: 30, maxScore: 3, description: 'Algorithm accuracy & edge case handling' },
      { id: 'r3', criteria: 'Implementation', weightPct: 20, maxScore: 2, description: 'Clean code structure & concurrency safety' },
      { id: 'r4', criteria: 'Explanation', weightPct: 20, maxScore: 2, description: 'Documentation and performance analysis report' }
    ]
  },
  {
    id: 'asg-2',
    classroomId: 'cls-102',
    title: 'DBMS Assignment 1',
    description: 'Write complex SQL analytical queries with indexing strategies and window functions.',
    maximumMarks: 10,
    minimumThreshold: 6,
    similarityThreshold: 10, // 10%
    dueDate: '2026-09-18T23:59:00',
    rubric: [
      { id: 'r1', criteria: 'Query Logic', weightPct: 40, maxScore: 4, description: 'Subquery and JOIN efficiency' },
      { id: 'r2', criteria: 'Indexing Strategy', weightPct: 30, maxScore: 3, description: 'Execution plan optimization' },
      { id: 'r3', criteria: 'Data Integrity', weightPct: 30, maxScore: 3, description: 'Constraint verification' }
    ]
  }
];

const INITIAL_EXTENSIONS = [
  {
    id: 'ext-1',
    assignmentId: 'asg-1',
    studentId: 'usr-s2', // Anita Roy
    studentName: 'Anita Roy',
    originalDueDate: '2026-09-20T23:59:00',
    extendedDueDate: '2026-09-23T23:59:00',
    reason: 'Medical emergency with doctor certificate attached.',
    status: 'APPROVED',
    approvedAt: '2026-09-19T10:00:00'
  }
];

const INITIAL_SUBMISSIONS = [
  {
    id: 'sub-1',
    assignmentId: 'asg-1',
    studentId: 'usr-s1', // Rahul Sharma
    studentName: 'Rahul Sharma',
    submittedAt: '2026-09-19T14:30:00',
    content: 'public class Scheduler { ... Process scheduling implementation with RoundRobin queue ... }',
    fileName: 'OperatingSystems_RahulSharma.zip',
    similarityPercentage: 7.5,
    plagiarismStatus: 'ACCEPTED',
    aiEvaluated: true,
    aiSuggestedGrade: 7.5,
    aiRubricBreakdown: { r1: 2.5, r2: 2.0, r3: 1.5, r4: 1.5 },
    aiFeedback: 'Solid implementation of Round Robin. Explanation of context switching latency could be slightly expanded.',
    status: 'PENDING_REVIEW', // Pending teacher approval
    teacherFinalGrade: null,
    teacherFeedback: '',
    isBelowThreshold: false
  },
  {
    id: 'sub-2',
    assignmentId: 'asg-1',
    studentId: 'usr-s3', // David Miller (Low Scorer Test Case)
    studentName: 'David Miller',
    submittedAt: '2026-09-19T18:20:00',
    content: 'Process scheduler incomplete code file. Missed thread synchronization logic.',
    fileName: 'OS_Assignment_David.cpp',
    similarityPercentage: 8.0,
    plagiarismStatus: 'ACCEPTED',
    aiEvaluated: true,
    aiSuggestedGrade: 4.0,
    aiRubricBreakdown: { r1: 1.5, r2: 1.0, r3: 1.0, r4: 0.5 },
    aiFeedback: 'Implementation lacks mutex locks and fails edge test cases for deadlock detection.',
    status: 'FINALIZED',
    teacherFinalGrade: 4.0, // Below threshold of 5/10 -> FLAGGED
    teacherFeedback: 'Requires remediation in concurrency concepts. Below minimum threshold.',
    isBelowThreshold: true
  },
  {
    id: 'sub-3',
    assignmentId: 'asg-1',
    studentId: 'usr-s4', // Priya Patel (Plagiarism Test Case)
    studentName: 'Priya Patel',
    submittedAt: '2026-09-20T10:15:00',
    content: 'Copied code snippet directly from public GitHub repository without citation.',
    fileName: 'OS_Priya.java',
    similarityPercentage: 24.5, // Exceeds 15% threshold
    plagiarismStatus: 'FLAGGED_PLAGIARISM',
    aiEvaluated: false,
    aiSuggestedGrade: null,
    aiRubricBreakdown: {},
    aiFeedback: 'Plagiarism check failed: 24.5% match detected against online repository.',
    status: 'REJECTED_PLAGIARISM',
    teacherFinalGrade: 0,
    teacherFeedback: 'Plagiarism similarity threshold exceeded (24.5% > 15%). Submission rejected.',
    isBelowThreshold: true
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    recipientEmail: 'parent.david@example.com',
    recipientRole: 'PARENT',
    studentId: 'usr-s3',
    studentName: 'David Miller',
    type: 'LOW_SCORE_FLAG',
    title: 'Academic Alert: Score Below Threshold',
    message: 'David Miller scored 4.0/10 in Operating Systems Assignment 1, which is below the minimum threshold (5.0/10). Please contact the instructor.',
    createdAt: '2026-09-19T19:00:00',
    read: false
  },
  {
    id: 'notif-2',
    recipientEmail: 'sarah.jenkins@university.edu',
    recipientRole: 'TEACHER',
    studentId: 'usr-s4',
    studentName: 'Priya Patel',
    type: 'PLAGIARISM_ALERT',
    title: 'Academic Integrity Alert',
    message: 'Priya Patel submitted work with 24.5% similarity (Allowed threshold: 15%). Submission automatically flagged.',
    createdAt: '2026-09-20T10:16:00',
    read: false
  }
];

const INITIAL_CERTIFICATES = [
  {
    id: 'cert-1',
    studentId: 'usr-s1',
    studentName: 'Rahul Sharma',
    title: 'National Level Hackathon 2026 - 1st Runner Up',
    category: 'Hackathon',
    issuer: 'Smart India Hackathon',
    issueDate: '2026-08-15',
    credentialUrl: 'https://example.com/certificates/sih-2026-rahul',
    description: 'Built an AI-driven automated grading assistant pipeline.',
    verified: true
  },
  {
    id: 'cert-2',
    studentId: 'usr-s2',
    studentName: 'Anita Roy',
    title: 'Cloud Computing Workshop Certification',
    category: 'Workshop',
    issuer: 'AWS Academy',
    issueDate: '2026-07-20',
    credentialUrl: 'https://example.com/certificates/aws-anita',
    description: 'Completed 40 hours of hands-on Docker and Kubernetes orchestration.',
    verified: true
  }
];

const INITIAL_CONFIG = {
  globalDefaultSimilarityThreshold: 15,
  autoEmailParents: true,
  aiModelProvider: 'Gemini 3.5 Pro (Mock)',
  systemVersion: 'v1.4.0-PROD'
};

// LocalStorage Helper
function getFromStorage(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    const parsed = JSON.parse(data);
    return (parsed && Array.isArray(fallback) && !Array.isArray(parsed)) ? fallback : (parsed || fallback);
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}


function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Service API Object
export const ApiService = {
  // Users
  getUsers: () => getFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS),
  
  // Classrooms
  getClassrooms: () => getFromStorage(STORAGE_KEYS.CLASSROOMS, INITIAL_CLASSROOMS),
  createClassroom: (classroomData, teacher) => {
    const classrooms = ApiService.getClassrooms();
    // Generate a unique 6-character Google Classroom-style code e.g. OS-8X9A
    const codePrefix = classroomData.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'CS');
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const classCode = `${codePrefix}-${randomCode}`;

    const newClassroom = {
      id: `cls-${Date.now()}`,
      name: classroomData.name,
      code: classCode,
      description: classroomData.description || 'Google Classroom LMS Course',
      section: classroomData.section || 'Section A',
      teacherId: teacher?.id || 'usr-t1',
      teacherName: teacher?.name || 'Prof. Sarah Jenkins',
      studentIds: []
    };

    classrooms.push(newClassroom);
    saveToStorage(STORAGE_KEYS.CLASSROOMS, classrooms);
    return newClassroom;
  },

  joinClassroomByCode: (code, studentId) => {
    const classrooms = ApiService.getClassrooms();
    const cleanCode = code.trim().toUpperCase();
    const targetIndex = classrooms.findIndex(c => c.code.toUpperCase() === cleanCode);

    if (targetIndex === -1) {
      return { success: false, error: 'Class code not found. Please verify the code with your teacher.' };
    }

    const classroom = classrooms[targetIndex];
    if (!classroom.studentIds) classroom.studentIds = [];

    if (classroom.studentIds.includes(studentId)) {
      return { success: true, classroom, message: 'Already enrolled in this classroom.' };
    }

    classroom.studentIds.push(studentId);
    classrooms[targetIndex] = classroom;
    saveToStorage(STORAGE_KEYS.CLASSROOMS, classrooms);
    return { success: true, classroom, message: 'Successfully joined classroom!' };
  },


  // Assignments
  getAssignments: () => getFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS),
  createAssignment: (assignment) => {
    const assignments = ApiService.getAssignments();
    const newAssignment = {
      ...assignment,
      id: `asg-${Date.now()}`
    };
    assignments.push(newAssignment);
    saveToStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);
    return newAssignment;
  },

  // Extensions (Individual Student Overrides)
  getExtensions: () => getFromStorage(STORAGE_KEYS.EXTENSIONS, INITIAL_EXTENSIONS),
  grantExtension: (extensionData) => {
    const extensions = ApiService.getExtensions();
    const newExtension = {
      ...extensionData,
      id: `ext-${Date.now()}`,
      status: 'APPROVED',
      approvedAt: new Date().toISOString()
    };
    extensions.push(newExtension);
    saveToStorage(STORAGE_KEYS.EXTENSIONS, extensions);
    return newExtension;
  },

  // Submissions & AI Grading
  getSubmissions: () => getFromStorage(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS),
  
  submitAssignment: (submissionData, assignment) => {
    const submissions = ApiService.getSubmissions();
    
    // Simulate Plagiarism/Similarity Check
    // Calculated based on content length or mock algorithm
    const mockSimilarity = Math.round(Math.random() * 20 * 10) / 10;
    const isPlagiarized = mockSimilarity > assignment.similarityThreshold;

    let submission = {
      ...submissionData,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      similarityPercentage: mockSimilarity,
      plagiarismStatus: isPlagiarized ? 'FLAGGED_PLAGIARISM' : 'ACCEPTED',
      aiEvaluated: !isPlagiarized,
      status: isPlagiarized ? 'REJECTED_PLAGIARISM' : 'PENDING_REVIEW',
      teacherFinalGrade: isPlagiarized ? 0 : null,
      isBelowThreshold: false
    };

    if (!isPlagiarized) {
      // Simulate AI Evaluation based on rubric criteria weights
      const totalMarks = assignment.maximumMarks;
      // AI score algorithm (random high score sample between 70% and 95%)
      const aiPercentage = 0.75 + (Math.random() * 0.2);
      const aiScore = Math.round(totalMarks * aiPercentage * 10) / 10;

      const aiRubricBreakdown = {};
      assignment.rubric.forEach(r => {
        aiRubricBreakdown[r.id] = Math.round((r.maxScore * aiPercentage) * 10) / 10;
      });

      submission.aiSuggestedGrade = aiScore;
      submission.aiRubricBreakdown = aiRubricBreakdown;
      submission.aiFeedback = `AI Evaluation: High correlation with rubric requirements. Clear execution of core logic. Suggested grade ${aiScore}/${totalMarks}.`;
    } else {
      submission.aiFeedback = `Submission rejected prior to AI grading. Similarity ${mockSimilarity}% exceeds allowed threshold ${assignment.similarityThreshold}%.`;
      
      // Auto-trigger notification
      ApiService.sendNotification({
        recipientEmail: 'teacher@university.edu',
        recipientRole: 'TEACHER',
        studentId: submissionData.studentId,
        studentName: submissionData.studentName,
        type: 'PLAGIARISM_ALERT',
        title: 'Plagiarism Threshold Exceeded',
        message: `Student ${submissionData.studentName} submitted work with ${mockSimilarity}% similarity (Threshold: ${assignment.similarityThreshold}%).`
      });
    }

    submissions.push(submission);
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, submissions);
    return submission;
  },

  reviewAiGrade: (submissionId, finalScore, teacherComments, assignment) => {
    const submissions = ApiService.getSubmissions();
    const index = submissions.findIndex(s => s.id === submissionId);
    if (index === -1) return null;

    const sub = submissions[index];
    const isBelow = finalScore < assignment.minimumThreshold;

    sub.teacherFinalGrade = parseFloat(finalScore);
    sub.teacherFeedback = teacherComments;
    sub.status = 'FINALIZED';
    sub.isBelowThreshold = isBelow;

    submissions[index] = sub;
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, submissions);

    // If score is below threshold, automatically dispatch notifications to Teacher, Student, and Parent
    if (isBelow) {
      const users = ApiService.getUsers();
      const student = users.find(u => u.id === sub.studentId);

      const notifMessage = `Alert: ${sub.studentName} scored ${finalScore}/${assignment.maximumMarks} in "${assignment.title}", which is below the minimum threshold (${assignment.minimumThreshold}/${assignment.maximumMarks}).`;

      // 1. Student Notification
      ApiService.sendNotification({
        recipientEmail: student?.email || 'student@university.edu',
        recipientRole: 'STUDENT',
        studentId: sub.studentId,
        studentName: sub.studentName,
        type: 'LOW_SCORE_FLAG',
        title: 'Assignment Score Threshold Alert',
        message: notifMessage
      });

      // 2. Parent Notification
      if (student?.parentEmail) {
        ApiService.sendNotification({
          recipientEmail: student.parentEmail,
          recipientRole: 'PARENT',
          studentId: sub.studentId,
          studentName: sub.studentName,
          type: 'LOW_SCORE_FLAG',
          title: 'Parent Notification: Academic Performance Threshold',
          message: notifMessage
        });
      }

      // 3. Teacher Notification
      ApiService.sendNotification({
        recipientEmail: 'sarah.jenkins@university.edu',
        recipientRole: 'TEACHER',
        studentId: sub.studentId,
        studentName: sub.studentName,
        type: 'LOW_SCORE_FLAG',
        title: 'Student Flagged Below Threshold',
        message: notifMessage
      });
    }

    return sub;
  },

  // Notifications
  getNotifications: () => getFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  sendNotification: (notifData) => {
    const notifications = ApiService.getNotifications();
    const newNotif = {
      ...notifData,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false
    };
    notifications.unshift(newNotif);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return newNotif;
  },

  // Certificates & Achievements
  getCertificates: () => getFromStorage(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES),
  addCertificate: (certData) => {
    const certificates = ApiService.getCertificates();
    const newCert = {
      ...certData,
      id: `cert-${Date.now()}`,
      verified: true
    };
    certificates.push(newCert);
    saveToStorage(STORAGE_KEYS.CERTIFICATES, certificates);
    return newCert;
  },

  // System Configuration
  getSystemConfig: () => getFromStorage(STORAGE_KEYS.SYSTEM_CONFIG, INITIAL_CONFIG),
  updateSystemConfig: (config) => {
    saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, config);
    return config;
  }
};
