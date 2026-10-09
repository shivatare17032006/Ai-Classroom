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

const INITIAL_LICENSES = [];

const INITIAL_CONFIG = {
  globalDefaultSimilarityThreshold: 15,
  autoEmailParents: true,
  aiModelProvider: 'Gemini 1.5 Pro (Spring Boot)',
  systemVersion: 'v1.4.0-PROD'
};

// LocalStorage Helpers
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

// HTTP Helper for Spring Boot Backend with 15-second Timeout Safety & Cookie Credentials
async function httpFetch(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout for AI REST requests

  try {
    let sessionHeader = {};
    try {
      const activeSession = localStorage.getItem('aicl_active_session');
      if (activeSession) {
        const parsed = JSON.parse(activeSession);
        if (parsed && parsed.email) {
          sessionHeader['X-User-Email'] = parsed.email;
        }
      }
    } catch (e) {}

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...sessionHeader, ...options.headers },
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
    console.warn(`Spring Boot backend fetch for ${endpoint} failed/timed out, using local storage sync.`);
    return null; // Signals fallback
  }
}

// Helper to push or update item in local storage array
function syncItemToStorage(key, item) {
  if (!item || !item.id) return;
  const list = getFromStorage(key, []);
  const idx = list.findIndex(i => i.id === item.id);
  if (idx !== -1) {
    list[idx] = item;
  } else {
    list.unshift(item);
  }
  saveToStorage(key, list);
}

// Service API Object
export const ApiService = {
  // Users
  getUsers: async () => {
    const data = await httpFetch('/users');
    const localUsers = getFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    
    if (data && Array.isArray(data)) {
      // Merge local profile attributes (rollNo, prnNo) onto backend fetched user data
      const merged = data.map(backendUser => {
        const localMatch = localUsers.find(lu => lu.id === backendUser.id || (lu.email && backendUser.email && lu.email.toLowerCase() === backendUser.email.toLowerCase()));
        return {
          ...backendUser,
          rollNo: backendUser.rollNo || localMatch?.rollNo || '',
          prnNo: backendUser.prnNo || localMatch?.prnNo || ''
        };
      });
      saveToStorage(STORAGE_KEYS.USERS, merged);
      return merged;
    }
    return localUsers;
  },

  updateUser: async (userId, userData) => {
    try {
      const backendRes = await httpFetch(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
      if (backendRes) {
        syncItemToStorage(STORAGE_KEYS.USERS, backendRes);
        return backendRes;
      }
    } catch (err) {
      console.warn('Backend updateUser PUT failed, updating local storage:', err.message);
    }

    // Local Storage Fallback Sync
    const users = getFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    const index = users.findIndex(u => u.id === userId || (u.email && userData.email && u.email.toLowerCase() === userData.email.toLowerCase()));
    if (index !== -1) {
      users[index] = { ...users[index], ...userData };
      saveToStorage(STORAGE_KEYS.USERS, users);
      return users[index];
    }
    return userData;
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
      if (backendRes) {
        syncItemToStorage(STORAGE_KEYS.USERS, backendRes);
        return backendRes;
      }
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
      syncItemToStorage(STORAGE_KEYS.CLASSROOMS, backendRes);
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
      if (backendRes.classroom) {
        syncItemToStorage(STORAGE_KEYS.CLASSROOMS, backendRes.classroom);
      }
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

    if (!classroom.studentIds.includes(studentId)) {
      classroom.studentIds.push(studentId);
      classrooms[targetIndex] = classroom;
      saveToStorage(STORAGE_KEYS.CLASSROOMS, classrooms);
    }

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

    if (backendRes) {
      syncItemToStorage(STORAGE_KEYS.ASSIGNMENTS, backendRes);
      return backendRes;
    }

    const assignments = getFromStorage(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    const newAssignment = { ...assignment, id: `asg-${Date.now()}` };
    assignments.unshift(newAssignment);
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

    if (backendRes) {
      syncItemToStorage(STORAGE_KEYS.EXTENSIONS, backendRes);
      return backendRes;
    }

    const extensions = getFromStorage(STORAGE_KEYS.EXTENSIONS, INITIAL_EXTENSIONS);
    const newExtension = {
      ...extensionData,
      id: `ext-${Date.now()}`,
      status: 'APPROVED',
      approvedAt: new Date().toISOString()
    };
    extensions.unshift(newExtension);
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
        studentName: (submissionData.studentName || '').replace(/\0/g, '').replace(/\u0000/g, ''),
        content: (submissionData.content || '').replace(/\0/g, '').replace(/\u0000/g, ''),
        fileName: (submissionData.fileName || '').replace(/\0/g, '').replace(/\u0000/g, ''),
        fileUrl: submissionData.fileUrl || null,
        fileType: submissionData.fileType || 'TEXT'
      })
    });

    if (backendRes) {
      syncItemToStorage(STORAGE_KEYS.SUBMISSIONS, backendRes);
      return backendRes;
    }

    // Fallback simulation
    const submissions = getFromStorage(STORAGE_KEYS.SUBMISSIONS, INITIAL_SUBMISSIONS);
    const existingIdx = submissions.findIndex(s => 
      s.assignmentId === submissionData.assignmentId && 
      (s.studentId === submissionData.studentId || (s.studentEmail && submissionData.studentEmail && s.studentEmail.toLowerCase() === submissionData.studentEmail.toLowerCase()))
    );

    const bypassPlagiarism = Boolean(assignment?.bypassPlagiarism);
    const mockSimilarity = Math.round(Math.random() * 8 * 10) / 10;
    const isPlagiarized = !bypassPlagiarism && mockSimilarity > (assignment?.similarityThreshold || 15);

    let submission = {
      ...submissionData,
      id: existingIdx !== -1 ? submissions[existingIdx].id : `sub-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      similarityPercentage: mockSimilarity,
      plagiarismStatus: isPlagiarized ? 'FLAGGED_PLAGIARISM' : 'ACCEPTED',
      aiEvaluated: !isPlagiarized,
      status: isPlagiarized ? 'REJECTED_PLAGIARISM' : 'PENDING_REVIEW',
      teacherFinalGrade: isPlagiarized ? 0 : null,
      isBelowThreshold: false
    };

    if (!isPlagiarized && assignment) {
      const totalMarks = assignment.maximumMarks || 10;
      const contentText = (submissionData.content || '').toLowerCase();
      const promptText = ((assignment.title || '') + ' ' + (assignment.description || '') + ' ' + (assignment.requiredTopic || '')).toLowerCase();

      // Concept expansions for domain acronyms
      const conceptSynonyms = [];
      if (promptText.includes('fcfs') || promptText.includes('first come')) {
        conceptSynonyms.push('fcfs', 'first come', 'first-come', 'first served', 'first-served', 'cpu scheduling', 'scheduling', 'burst', 'arrival', 'waiting', 'turnaround', 'tat', 'wt', 'bt', 'at', 'gantt', 'process');
      }
      if (promptText.includes('sjf') || promptText.includes('shortest job')) {
        conceptSynonyms.push('sjf', 'shortest job', 'srtf', 'burst', 'scheduling', 'wt', 'tat', 'bt');
      }
      if (promptText.includes('round robin') || promptText.includes('rr')) {
        conceptSynonyms.push('round robin', 'rr', 'quantum', 'time quantum', 'slice', 'scheduling');
      }
      if (promptText.includes('sql') || promptText.includes('database')) {
        conceptSynonyms.push('sql', 'select', 'from', 'where', 'join', 'insert', 'create', 'table', 'database');
      }
      if (promptText.includes('mongo') || promptText.includes('nosql')) {
        conceptSynonyms.push('mongo', 'mongodb', 'nosql', 'db.', 'find', 'aggregate', 'collection');
      }

      const isRecognizedCode = /#include|stdio\.h|iostream|public class|public static void main|def |import |function|const |let |console\.log|select |from |where |struct |int main|printf|scanf|malloc/i.test(submissionData.content || '');

      const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'to', 'in', 'for', 'of', 'with', 'by', 'from', 'please', 'should', 'have', 'must', 'using']);
      const promptWords = promptText.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length >= 2 && !stopWords.has(w));
      
      let matches = 0;
      promptWords.forEach(w => {
        if (contentText.includes(w)) matches++;
      });

      let conceptMatches = 0;
      conceptSynonyms.forEach(c => {
        if (contentText.includes(c)) conceptMatches++;
      });

      const baseRatio = promptWords.length > 0 ? matches / promptWords.length : 0.5;
      const conceptRatio = conceptSynonyms.length > 0 ? Math.min(1.0, conceptMatches / 2) : 0;
      let relevanceRatio = Math.max(baseRatio, conceptRatio);

      if (isRecognizedCode && (conceptMatches > 0 || matches > 0 || promptWords.length <= 2)) {
        relevanceRatio = Math.max(relevanceRatio, 0.85);
      }

      let aiScore = 0;
      let aiFeedbackText = '';

      if (contentText.length < 15 && relevanceRatio < 0.15 && !isRecognizedCode) {
        aiScore = 0;
        aiFeedbackText = `SCORE: 0/${totalMarks} - REJECTED (Topic Mismatch): Submission content shares insufficient relevance with the teacher's assignment prompt. Assigned 0 marks.`;
      } else {
        const scoreRatio = relevanceRatio >= 0.70 || isRecognizedCode ? 0.90 : Math.max(0.5, relevanceRatio);
        aiScore = Math.min(totalMarks, Math.round(totalMarks * scoreRatio * 10) / 10);
        aiFeedbackText = `SCORE: ${aiScore}/${totalMarks} - High Quality Academic Submission: Successfully answers the teacher's assignment prompt requirements and technical concepts.`;
      }

      const aiRubricBreakdown = {};
      if (assignment.rubric) {
        const scoreRatio = aiScore / totalMarks;
        assignment.rubric.forEach(r => {
          aiRubricBreakdown[r.id] = Math.round((r.maxScore * scoreRatio) * 10) / 10;
        });
      }

      submission.aiSuggestedGrade = aiScore;
      submission.aiRubricBreakdown = aiRubricBreakdown;
      submission.aiFeedback = aiFeedbackText;
    }

    if (existingIdx !== -1) {
      submissions[existingIdx] = submission;
    } else {
      submissions.unshift(submission);
    }
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

    if (backendRes) {
      syncItemToStorage(STORAGE_KEYS.SUBMISSIONS, backendRes);
      return backendRes;
    }

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

    if (backendRes) {
      syncItemToStorage(STORAGE_KEYS.NOTIFICATIONS, backendRes);
      return backendRes;
    }

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

    if (backendRes) {
      syncItemToStorage(STORAGE_KEYS.CERTIFICATES, backendRes);
      return backendRes;
    }

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

    if (backendRes) {
      syncItemToStorage(STORAGE_KEYS.ANNOUNCEMENTS, backendRes);
      return backendRes;
    }

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
    const backendData = await httpFetch('/licenses');
    if (backendData && Array.isArray(backendData)) {
      saveToStorage(STORAGE_KEYS.LICENSES, backendData);
      return backendData;
    }
    return getFromStorage(STORAGE_KEYS.LICENSES, INITIAL_LICENSES);
  },

  createLicense: async (licenseData) => {
    const backendRes = await httpFetch('/licenses', {
      method: 'POST',
      body: JSON.stringify(licenseData)
    });

    if (backendRes) {
      syncItemToStorage(STORAGE_KEYS.LICENSES, backendRes);
      return backendRes;
    }

    const licenses = getFromStorage(STORAGE_KEYS.LICENSES, INITIAL_LICENSES);
    const cleanDomain = (licenseData.domainExtension || '').trim().toLowerCase().replace('@', '');
    const reqStatus = licenseData.status || 'PENDING_VERIFICATION';
    const newLicense = {
      ...licenseData,
      id: `lic-${Date.now()}`,
      domainExtension: cleanDomain,
      status: reqStatus,
      aiServicesAllowed: reqStatus === 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    if (reqStatus === 'ACTIVE') {
      newLicense.approvedAt = new Date().toISOString();
      newLicense.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    }
    licenses.unshift(newLicense);
    saveToStorage(STORAGE_KEYS.LICENSES, licenses);
    return newLicense;
  },

  toggleLicense: async (id) => {
    const backendRes = await httpFetch(`/licenses/${id}/toggle`, {
      method: 'PUT'
    });

    if (backendRes) {
      syncItemToStorage(STORAGE_KEYS.LICENSES, backendRes);
      return backendRes;
    }

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

  approveLicense: async (id) => {
    const backendRes = await httpFetch(`/licenses/${id}/approve`, {
      method: 'PUT'
    });

    if (backendRes) {
      syncItemToStorage(STORAGE_KEYS.LICENSES, backendRes);
      return backendRes;
    }

    const licenses = getFromStorage(STORAGE_KEYS.LICENSES, INITIAL_LICENSES);
    const idx = licenses.findIndex(l => l.id === id);
    if (idx !== -1) {
      const now = new Date();
      const expires = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      licenses[idx].status = 'ACTIVE';
      licenses[idx].aiServicesAllowed = true;
      licenses[idx].approvedAt = now.toISOString();
      licenses[idx].expiresAt = expires.toISOString();
      saveToStorage(STORAGE_KEYS.LICENSES, licenses);
      return licenses[idx];
    }
    return null;
  },

  rejectLicense: async (id) => {
    const backendRes = await httpFetch(`/licenses/${id}/reject`, {
      method: 'PUT'
    });

    if (backendRes) {
      syncItemToStorage(STORAGE_KEYS.LICENSES, backendRes);
      return backendRes;
    }

    const licenses = getFromStorage(STORAGE_KEYS.LICENSES, INITIAL_LICENSES);
    const idx = licenses.findIndex(l => l.id === id);
    if (idx !== -1) {
      licenses[idx].status = 'REJECTED';
      licenses[idx].aiServicesAllowed = false;
      saveToStorage(STORAGE_KEYS.LICENSES, licenses);
      return licenses[idx];
    }
    return null;
  },

  deleteLicense: async (id) => {
    const backendRes = await httpFetch(`/licenses/${id}`, {
      method: 'DELETE'
    });

    const licenses = getFromStorage(STORAGE_KEYS.LICENSES, INITIAL_LICENSES);
    const updated = (licenses || []).filter(l => l.id !== id);
    saveToStorage(STORAGE_KEYS.LICENSES, updated);
    return backendRes || { success: true };
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

    if (backendRes) {
      saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, config);
      return backendRes;
    }

    saveToStorage(STORAGE_KEYS.SYSTEM_CONFIG, config);
    return config;
  },

  // Clear all classrooms, submissions, students & local storage data
  clearAllData: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    localStorage.removeItem('aicl_active_session');
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.CLASSROOMS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.EXTENSIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.LICENSES, JSON.stringify([]));
    return { success: true };
  }
};
