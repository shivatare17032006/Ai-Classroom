import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClassroomProvider, useClassroom } from './context/ClassroomContext';
import { Navbar } from './components/Navigation/Navbar';
import { Sidebar } from './components/Navigation/Sidebar';
import { LoginPage } from './components/Auth/LoginPage';
import { ClassroomList } from './components/Classroom/ClassroomList';
import { ClassroomDetailView } from './components/Classroom/ClassroomDetailView';
import { CertificateLocker } from './components/Student/CertificateLocker';
import { TeacherCertificatesView } from './components/Teacher/TeacherCertificatesView';
import { AdminDashboard } from './components/Admin/AdminDashboard';

const MainLayout = () => {
  const { currentUser, loading } = useAuth();
  const { setActiveClassroom } = useClassroom();
  const [activeTab, setActiveTab] = useState('classrooms');
  const [selectedCourse, setSelectedCourse] = useState(null);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        Loading Academic Portal...
      </div>
    );
  }

  const role = currentUser?.role || 'TEACHER';

  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <Navbar />
      
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'classrooms') setSelectedCourse(null);
          }} 
        />
        
        <main className="main-content">
          {activeTab === 'classrooms' && (
            selectedCourse ? (
              <ClassroomDetailView 
                classroom={selectedCourse} 
                onBack={() => setSelectedCourse(null)} 
              />
            ) : (
              <ClassroomList 
                onSelectClassroom={(cls) => {
                  setSelectedCourse(cls);
                  setActiveClassroom(cls);
                }} 
              />
            )
          )}

          {activeTab === 'certificates' && (
            role === 'TEACHER' ? <TeacherCertificatesView /> : <CertificateLocker />
          )}

          {activeTab === 'admin' && (
            <AdminDashboard />
          )}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ClassroomProvider>
        <MainLayout />
      </ClassroomProvider>
    </AuthProvider>
  );
}

export default App;
