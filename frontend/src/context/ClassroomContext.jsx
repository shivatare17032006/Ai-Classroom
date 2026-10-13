import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiService } from '../services/api';

const ClassroomContext = createContext();

export const ClassroomProvider = ({ children }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [extensions, setExtensions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [systemConfig, setSystemConfig] = useState({});
  const [licenses, setLicenses] = useState([]);
  const [activeClassroom, setActiveClassroom] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshData = async () => {
    try {
      const [
        loadedClassrooms,
        loadedAssignments,
        loadedSubmissions,
        loadedExtensions,
        loadedNotifs,
        loadedCerts,
        loadedAnnouncements,
        loadedConfig,
        loadedLicenses
      ] = await Promise.all([
        ApiService.getClassrooms(),
        ApiService.getAssignments(),
        ApiService.getSubmissions(),
        ApiService.getExtensions(),
        ApiService.getNotifications(),
        ApiService.getCertificates(),
        ApiService.getAnnouncements(),
        ApiService.getSystemConfig(),
        ApiService.getLicenses()
      ]);

      const safeClassrooms = loadedClassrooms || [];
      setClassrooms(safeClassrooms);
      setAssignments(loadedAssignments || []);
      setSubmissions(loadedSubmissions || []);
      setExtensions(loadedExtensions || []);
      setNotifications(loadedNotifs || []);
      setCertificates(loadedCerts || []);
      setAnnouncements(loadedAnnouncements || []);
      setSystemConfig(loadedConfig || {});
      setLicenses(loadedLicenses || []);

      // Auto-set active classroom if currently null
      setActiveClassroom(prev => {
        if (!prev && safeClassrooms.length > 0) return safeClassrooms[0];
        if (prev) {
          const matched = safeClassrooms.find(c => c.id === prev.id);
          return matched || (safeClassrooms.length > 0 ? safeClassrooms[0] : null);
        }
        return null;
      });

    } catch (e) {
      console.error('Error refreshing data from backend:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    // 1. Polling every 15 seconds (cloud DB - Supabase has ~150-300ms latency per request)
    const interval = setInterval(() => {
      refreshData();
    }, 15000);

    // 2. Cross-tab storage change listener
    const handleStorageChange = () => {
      refreshData();
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Action Creators
  const addAssignment = async (assignmentData) => {
    const created = await ApiService.createAssignment(assignmentData);
    await refreshData();
    return created;
  };

  const addClassroom = async (classroomData, teacher) => {
    const created = await ApiService.createClassroom(classroomData, teacher);
    if (created) {
      setClassrooms(prev => {
        const existingIndex = prev.findIndex(classroom => classroom.id === created.id);
        if (existingIndex === -1) return [...prev, created];

        const updated = [...prev];
        updated[existingIndex] = created;
        return updated;
      });
      setActiveClassroom(created);

    }
    return created;
  };

  const joinClassroom = async (code, studentId) => {
    const res = await ApiService.joinClassroomByCode(code, studentId);
    if (res && res.success) {
      if (res.classroom) {
        setClassrooms(prev => {
          const existingIndex = prev.findIndex(classroom => classroom.id === res.classroom.id);
          if (existingIndex === -1) return [...prev, res.classroom];

          const updated = [...prev];
          updated[existingIndex] = res.classroom;
          return updated;
        });
        setActiveClassroom(res.classroom);
      }

    }
    return res;
  };

  const submitStudentAssignment = async (submissionData, assignment) => {
    const result = await ApiService.submitAssignment(submissionData, assignment);
    await refreshData();
    return result;
  };

  const finalizeAiGrade = async (submissionId, finalScore, teacherComments, assignment) => {
    const updated = await ApiService.reviewAiGrade(submissionId, finalScore, teacherComments, assignment);
    await refreshData();
    return updated;
  };

  const grantIndividualExtension = async (extensionData) => {
    const created = await ApiService.grantExtension(extensionData);
    await refreshData();
    return created;
  };

  const uploadCertificate = async (certData) => {
    const created = await ApiService.addCertificate(certData);
    await refreshData();
    return created;
  };

  const postAnnouncement = async (announcementData) => {
    const created = await ApiService.createAnnouncement(announcementData);
    await refreshData();
    return created;
  };

  const updateConfig = async (config) => {
    const updated = await ApiService.updateSystemConfig(config);
    await refreshData();
    return updated;
  };

  const addLicense = async (licenseData) => {
    const created = await ApiService.createLicense(licenseData);
    await refreshData();
    return created;
  };

  const toggleLicense = async (id) => {
    const updated = await ApiService.toggleLicense(id);
    await refreshData();
    return updated;
  };

  const approveLicense = async (id) => {
    const updated = await ApiService.approveLicense(id);
    await refreshData();
    return updated;
  };

  const rejectLicense = async (id) => {
    const updated = await ApiService.rejectLicense(id);
    await refreshData();
    return updated;
  };

  const deleteLicense = async (id) => {
    const res = await ApiService.deleteLicense(id);
    await refreshData();
    return res;
  };

  return (
    <ClassroomContext.Provider value={{
      classrooms,
      activeClassroom,
      setActiveClassroom,
      assignments,
      submissions,
      extensions,
      notifications,
      certificates,
      announcements,
      systemConfig,
      licenses,
      loading,
      addAssignment,
      addClassroom,
      joinClassroom,
      submitStudentAssignment,
      finalizeAiGrade,
      grantIndividualExtension,
      uploadCertificate,
      postAnnouncement,
      updateConfig,
      addLicense,
      toggleLicense,
      approveLicense,
      rejectLicense,
      deleteLicense,
      refreshData
    }}>
      {children}
    </ClassroomContext.Provider>
  );
};

export const useClassroom = () => useContext(ClassroomContext);
