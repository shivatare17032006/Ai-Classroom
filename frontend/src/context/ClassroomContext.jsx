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

    } catch (e) {
      console.error('Error refreshing data from backend:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Action Creators
  const addAssignment = async (assignmentData) => {
    const created = await ApiService.createAssignment(assignmentData);
    await refreshData();
    return created;
  };

  const addClassroom = async (classroomData, teacher) => {
    const created = await ApiService.createClassroom(classroomData, teacher);
    await refreshData();
    if (created) setActiveClassroom(created);
    return created;
  };

  const joinClassroom = async (code, studentId) => {
    const res = await ApiService.joinClassroomByCode(code, studentId);
    if (res && res.success) {
      await refreshData();
      if (res.classroom) setActiveClassroom(res.classroom);
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
      refreshData
    }}>
      {children}
    </ClassroomContext.Provider>
  );
};

export const useClassroom = () => useContext(ClassroomContext);
