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
  const [systemConfig, setSystemConfig] = useState({});
  const [activeClassroom, setActiveClassroom] = useState(null);

  const refreshData = () => {
    const loadedClassrooms = ApiService.getClassrooms() || [];
    const loadedAssignments = ApiService.getAssignments() || [];
    const loadedSubmissions = ApiService.getSubmissions() || [];
    const loadedExtensions = ApiService.getExtensions() || [];
    const loadedNotifs = ApiService.getNotifications() || [];
    const loadedCerts = ApiService.getCertificates() || [];
    const loadedConfig = ApiService.getSystemConfig() || {};

    setClassrooms(loadedClassrooms);
    setAssignments(loadedAssignments);
    setSubmissions(loadedSubmissions);
    setExtensions(loadedExtensions);
    setNotifications(loadedNotifs);
    setCertificates(loadedCerts);
    setSystemConfig(loadedConfig);

    if (loadedClassrooms.length > 0 && !activeClassroom) {
      setActiveClassroom(loadedClassrooms[0]);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Action Creators
  const addAssignment = (assignmentData) => {
    ApiService.createAssignment(assignmentData);
    refreshData();
  };

  const addClassroom = (classroomData, teacher) => {
    const created = ApiService.createClassroom(classroomData, teacher);
    refreshData();
    setActiveClassroom(created);
    return created;
  };

  const joinClassroom = (code, studentId) => {
    const res = ApiService.joinClassroomByCode(code, studentId);
    if (res && res.success) {
      refreshData();
      if (res.classroom) setActiveClassroom(res.classroom);
    }
    return res;
  };

  const submitStudentAssignment = (submissionData, assignment) => {
    const result = ApiService.submitAssignment(submissionData, assignment);
    refreshData();
    return result;
  };

  const finalizeAiGrade = (submissionId, finalScore, teacherComments, assignment) => {
    const updated = ApiService.reviewAiGrade(submissionId, finalScore, teacherComments, assignment);
    refreshData();
    return updated;
  };

  const grantIndividualExtension = (extensionData) => {
    const created = ApiService.grantExtension(extensionData);
    refreshData();
    return created;
  };

  const uploadCertificate = (certData) => {
    const created = ApiService.addCertificate(certData);
    refreshData();
    return created;
  };

  const updateConfig = (config) => {
    const updated = ApiService.updateSystemConfig(config);
    refreshData();
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
      systemConfig,
      addAssignment,
      addClassroom,
      joinClassroom,
      submitStudentAssignment,
      finalizeAiGrade,
      grantIndividualExtension,
      uploadCertificate,
      updateConfig,
      refreshData
    }}>
      {children}
    </ClassroomContext.Provider>
  );
};

export const useClassroom = () => useContext(ClassroomContext);
