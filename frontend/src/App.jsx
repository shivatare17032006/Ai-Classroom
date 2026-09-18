import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClassroomProvider, useClassroom } from './context/ClassroomContext';
import { Navbar } from './components/Navigation/Navbar';
import { Sidebar } from './components/Navigation/Sidebar';
import { LoginPage } from './components/Auth/LoginPage';
import { ClassroomList } from './components/Classroom/ClassroomList';
import { ClassroomDetailView } from './components/Classroom/ClassroomDetailView';
import { CertificateLocker } from './components/Student/CertificateLocker';
import { TeacherCertificatesView } from './components/Teacher/TeacherCertificatesView';
import { StudentTodoView } from './components/Student/StudentTodoView';
import { TeacherReviewView } from './components/Teacher/TeacherReviewView';
import { AdminDashboard } from './components/Admin/AdminDashboard';

const MainLayout = () => {
  const { currentUser, loading } = useAuth();
  const { setActiveClassroom } = useClassroom();
  
  const role = currentUser?.role || 'TEACHER';
  const [activeTab, setActiveTab] = useState(role === 'ADMIN' ? 'admin' : 'classrooms');
  const [selectedCourse, setSelectedCourse] = useState(null);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), var(--bg-primary)',
        color: 'var(--text-primary)',
        gap: '1rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-purple))',
          padding: '1rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)',
          animation: 'pulse 1.5s infinite'
        }}>
          <Sparkles color="#ffffff" size={36} />
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Connecting to Academic Portal...</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Initializing Security & System Governance</p>
      </div>
    );
  }

  // If user is not logged in, show professional Sign In / Registration page
  if (!currentUser) {
    return <LoginPage />;
  }

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

          {activeTab === 'todo' && (
            role === 'TEACHER' ? <TeacherReviewView /> : <StudentTodoView />
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
