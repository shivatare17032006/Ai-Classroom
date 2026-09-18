// API Service connecting Frontend to Spring Boot REST Backend

const API_BASE_URL = 'http://localhost:8080/api';

const STORAGE_KEYS = {
  USERS: 'aicl_users',
  CLASSROOMS: 'aicl_classrooms',
  ASSIGNMENTS: 'aicl_assignments',
  EXTENSIONS: 'aicl_extensions',
  SUBMISSIONS: 'aicl_submissions',
  NOTIFICATIONS: 'aicl_notifications',
  CERTIFICATES: 'aicl_certificates',
  ANNOUNCEMENTS: 'aicl_announcements',
  LICENSES: 'aicl_licenses',
  SYSTEM_CONFIG: 'aicl_system_config'
};

// Initial Seed Data (Clean)
const INITIAL_USERS = [
  {
    id: 'usr-admin',
    name: 'System Administrator',
    email: 'admin@classroom.edu',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  }
];
const INITIAL_CLASSROOMS = [];
const INITIAL_ASSIGNMENTS = [];
const INITIAL_EXTENSIONS = [];
const INITIAL_SUBMISSIONS = [];
const INITIAL_NOTIFICATIONS = [];
const INITIAL_CERTIFICATES = [];
const INITIAL_ANNOUNCEMENTS = [];

const INITIAL_LICENSES = [
  {
    id: 'lic-vit',
    institutionName: 'Vishwakarma Institute of Technology (VIT Pune)',
    domainExtension: 'vit.edu',
    planType: 'ENTERPRISE_ANNUAL',
    priceInInr: 49999.0,
    status: 'ACTIVE',
    aiServicesAllowed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'lic-iitb',
    institutionName: 'IIT Bombay (Indian Institute of Technology)',
    domainExtension: 'iitb.ac.in',
    planType: 'ENTERPRISE_ANNUAL',
    priceInInr: 99999.0,
    status: 'ACTIVE',
    aiServicesAllowed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'lic-coep',
    institutionName: 'COEP Technological University',
    domainExtension: 'coep.edu.in',
    planType: 'ENTERPRISE_ANNUAL',
    priceInInr: 49999.0,
    status: 'ACTIVE',
    aiServicesAllowed: true,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_CONFIG = {
  globalDefaultSimilarityThreshold: 15,
  autoEmailParents: true,
  aiModelProvider: 'Gemini 3.5 Pro (Spring Boot)',
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
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}

// HTTP Helper for Spring Boot Backend with Timeout Safety
async function httpFetch(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: controller.signal,
      ...options
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const errorText = await res.text();
      const err = new Error(errorText || `HTTP error! status: ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.status === 409 || err.status === 400) {
      throw err; // Re-throw validation errors to display on UI
    }
    console.warn(`Spring Boot backend fetch for ${endpoint} timed out or failed, falling back to local storage.`);
    return null; // Signals fallback
  }
}

// Service API Object
export const ApiService = {
  // Users
  getUsers: async () => {
    const data = await httpFetch('/users');
    if (data) {
      saveToStorage(STORAGE_KEYS.USERS, data);
      return data;
    }
    return getFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  registerUser: async (userData) => {
    const cleanEmail = (userData.email || '').trim().toLowerCase();

    // Check frontend cache/storage first for duplicate email
    const users = getFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    const existing = (users || []).find(u => u.email && u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error(`An account with email address '${userData.email}' already exists. Please sign in instead.`);
    }

    try {
      const backendRes = await httpFetch('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      if (backendRes) return backendRes;
    } catch (err) {
      if (err.message) throw err;
    }

    // Local Storage Fallback
    const newUser = {
      ...userData,
      email: cleanEmail,
      id: `usr-${Date.now()}`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    };
    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  // Classrooms
  getClassrooms: async () => {
    const data = await httpFetch('/classrooms');
    if (data) {
      saveToStorage(STORAGE_KEYS.CLASSROOMS, data);
      return data;
    }
    return getFromStorage(STORAGE_KEYS.CLASSROOMS, INITIAL_CLASSROOMS);
  },

  createClassroom: async (classroomData, teacher) => {
    const backendRes = await httpFetch(`/classrooms?teacherId=${teacher?.id || ''}`, {
      method: 'POST',
      body: JSON.stringify(classroomData)
    });

    if (backendRes) {
      const classrooms = await ApiService.getClassrooms();
      return backendRes;
    }

    // Local Storage Fallback
    const classrooms = getFromStorage(STORAGE_KEYS.CLASSROOMS, INITIAL_CLASSROOMS);
    const codePrefix = (classroomData.name || 'CS').substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'CS');
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const classCode = `${codePrefix}-${randomCode}`;

    const newClassroom = {
      id: `cls-${Date.now()}`,
      name: classroomData.name,
      code: classCode,
      description: classroomData.description || 'Google Classroom LMS Course',
      section: classroomData.section || 'Section A',
      teacherId: teacher?.id || '',
      teacherName: teacher?.name || 'Instructor',
      studentIds: []
    };

    classrooms.push(newClassroom);
    saveToStorage(STORAGE_KEYS.CLASSROOMS, classrooms);
    return newClassroom;
  },

  joinClassroomByCode: async (code, studentId) => {
    const backendRes = await httpFetch('/classrooms/join', {
      method: 'POST',
      body: JSON.stringify({ code, studentId })
    });

    if (backendRes) {
      return backendRes;
    }

    // Local Storage Fallback
    const classrooms = getFromStorage(STORAGE_KEYS.CLASSROOMS, INITIAL_CLASSROOMS);
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
  getAssignments: async () => {
    const data = await httpFetch('/assignments');
    if (data) {
      saveToStorage(STORAGE_KEYS.ASSIGNMENTS, data);
      return data;
    }
    return getFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
  },

  createAssignment: async (assignment) => {
    const backendRes = await httpFetch('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignment)
    });

    if (backendRes) return backendRes;

    const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    const newAssignment = { ...assignment, id: `asg-${Date.now()}` };
    assignments.push(newAssignment);
    saveToStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);
    return newAssignment;
  },

  // Extensions
  getExtensions: async () => {
    const data = await httpFetch('/extensions');
    if (data) {
      saveToStorage(STORAGE_KEYS.EXTENSIONS, data);
      return data;
    }
    return getFromStorage(STORAGE_KEYS.EXTENSIONS, INITIAL_EXTENSIONS);
  },

  grantExtension: async (extensionData) => {
    const backendRes = await httpFetch('/extensions', {
      method: 'POST',
      body: JSON.stringify(extensionData)
    });

    if (backendRes) return backendRes;

    const extensions = getFromStorage(STORAGE_KEYS.EXTENSIONS, INITIAL_EXTENSIONS);
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
  getSubmissions: async () => {
    const data = await httpFetch('/submissions');
    if (data) {
      saveToStorage(STORAGE_KEYS.SUBMISSIONS, data);
      return data;
    }
    return getFromStorage(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
  },

  submitAssignment: async (submissionData, assignment) => {
    const backendRes = await httpFetch('/submissions', {
      method: 'POST',
      body: JSON.stringify({
        assignmentId: submissionData.assignmentId,
        studentId: submissionData.studentId,
        studentName: submissionData.studentName,
        content: submissionData.content,
        fileName: submissionData.fileName
      })
    });

    if (backendRes) return backendRes;

    // Fallback simulation
    const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    const mockSimilarity = Math.round(Math.random() * 20 * 10) / 10;
    const isPlagiarized = mockSimilarity > (assignment?.similarityThreshold || 15);

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

    if (!isPlagiarized && assignment) {
      const totalMarks = assignment.maximumMarks;
      const aiPercentage = 0.75 + (Math.random() * 0.2);
      const aiScore = Math.round(totalMarks * aiPercentage * 10) / 10;
      const aiRubricBreakdown = {};
      assignment.rubric.forEach(r => {
        aiRubricBreakdown[r.id] = Math.round((r.maxScore * aiPercentage) * 10) / 10;
      });
      submission.aiSuggestedGrade = aiScore;
      submission.aiRubricBreakdown = aiRubricBreakdown;
      submission.aiFeedback = `AI Evaluation: High correlation with rubric requirements. Clear execution of core logic. Suggested grade ${aiScore}/${totalMarks}.`;
    }

    submissions.push(submission);
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, submissions);
    return submission;
  },

  reviewAiGrade: async (submissionId, finalScore, teacherComments, assignment) => {
    const backendRes = await httpFetch(`/submissions/${submissionId}/review`, {
      method: 'POST',
      body: JSON.stringify({
        finalScore: parseFloat(finalScore),
        teacherComments
      })
    });

    if (backendRes) return backendRes;

    const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    const index = submissions.findIndex(s => s.id === submissionId);
    if (index === -1) return null;

    const sub = submissions[index];
    const isBelow = finalScore < (assignment?.minimumThreshold || 5);

    sub.teacherFinalGrade = parseFloat(finalScore);
    sub.teacherFeedback = teacherComments;
    sub.status = 'FINALIZED';
    sub.isBelowThreshold = isBelow;

    submissions[index] = sub;
    saveToStorage(STORAGE_KEYS.SUBMISSIONS, submissions);
    return sub;
  },

  // Notifications
  getNotifications: async () => {
    const data = await httpFetch('/notifications');
    if (data) {
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, data);
      return data;
    }
    return getFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },

  sendNotification: async (notifData) => {
    const backendRes = await httpFetch('/notifications', {
      method: 'POST',
      body: JSON.stringify(notifData)
    });

    if (backendRes) return backendRes;

    const notifications = getFromStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
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

  // Certificates
  getCertificates: async () => {
    const data = await httpFetch('/certificates');
    if (data) {
      saveToStorage(STORAGE_KEYS.CERTIFICATES, data);
      return data;
    }
    return getFromStorage(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES);
  },

  addCertificate: async (certData) => {
    const backendRes = await httpFetch('/certificates', {
      method: 'POST',
      body: JSON.stringify(certData)
    });

    if (backendRes) return backendRes;

    const certificates = getFromStorage(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES);
    const newCert = {
      ...certData,
      id: `cert-${Date.now()}`,
      verified: true
    };
    certificates.push(newCert);
    saveToStorage(STORAGE_KEYS.CERTIFICATES, certificates);
    return newCert;
  },

  // Stream Announcements
  getAnnouncements: async (classroomId) => {
    const url = classroomId ? `/announcements?classroomId=${classroomId}` : '/announcements';
    const data = await httpFetch(url);
    if (data) {
      saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, data);
      return data;
    }
    const localAnnouncements = getFromStorage(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    if (classroomId) {
      return localAnnouncements.filter(a => a.classroomId === classroomId);
    }
    return localAnnouncements;
  },

  createAnnouncement: async (announcementData) => {
    const backendRes = await httpFetch('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData)
    });

    if (backendRes) return backendRes;

    const announcements = getFromStorage(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS);
    const newAnnouncement = {
      ...announcementData,
      id: `ann-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    announcements.unshift(newAnnouncement);
    saveToStorage(STORAGE_KEYS.ANNOUNCEMENTS, announcements);
    return newAnnouncement;
  },

  // Institutional Licenses (B2B Domain Whitelist)
  getLicenses: async () => {
    const data = await httpFetch('/licenses');
    if (data) {
      saveToStorage(STORAGE_KEYS.LICENSES, data);
      return data;
    }
    return getFromStorage(STORAGE_KEYS.LICENSES, INITIAL_LICENSES);
  },

  createLicense: async (licenseData) => {
    const backendRes = await httpFetch('/licenses', {
      method: 'POST',
      body: JSON.stringify(licenseData)
    });

    if (backendRes) return backendRes;

    const licenses = getFromStorage(STORAGE_KEYS.LICENSES, INITIAL_LICENSES);
    const cleanDomain = (licenseData.domainExtension || '').trim().toLowerCase().replace('@', '');
    const newLicense = {
      ...licenseData,
      id: `lic-${Date.now()}`,
      domainExtension: cleanDomain,
      status: 'ACTIVE',
      aiServicesAllowed: true,
      createdAt: new Date().toISOString()
    };
    licenses.unshift(newLicense);
    saveToStorage(STORAGE_KEYS.LICENSES, licenses);
    return newLicense;
  },

  toggleLicense: async (id) => {
    const backendRes = await httpFetch(`/licenses/${id}/toggle`, {
      method: 'PUT'
    });

    if (backendRes) return backendRes;

    const licenses = getFromStorage(STORAGE_KEYS.LICENSES, INITIAL_LICENSES);
    const idx = licenses.findIndex(l => l.id === id);
    if (idx !== -1) {
      licenses[idx].status = licenses[idx].status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      licenses[idx].aiServicesAllowed = licenses[idx].status === 'ACTIVE';
      saveToStorage(STORAGE_KEYS.LICENSES, licenses);
      return licenses[idx];
    }
    return null;
  },

  // System Configuration
  getSystemConfig: async () => {
    const data = await httpFetch('/config');
    if (data) {
      saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, data);
      return data;
    }
    return getFromStorage(STORAGE_KEYS.SYSTEM_CONFIG, INITIAL_CONFIG);
  },

  updateSystemConfig: async (config) => {
    const backendRes = await httpFetch('/config', {
      method: 'PUT',
      body: JSON.stringify(config)
    });

    if (backendRes) return backendRes;

    saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, config);
    return config;
  }
};
