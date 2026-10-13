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
import { TeacherBillingView } from './components/Teacher/TeacherBillingView';
import { TeacherSoftwareShowcaseView } from './components/Teacher/TeacherSoftwareShowcaseView';
import { StudentTodoView } from './components/Student/StudentTodoView';
import { TeacherReviewView } from './components/Teacher/TeacherReviewView';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { InstitutionalBenefitModal } from './components/Common/InstitutionalBenefitModal';
import { CookieConsentModal } from './components/Common/CookieConsentModal';

const MainLayout = () => {
  const { currentUser, loading, isProUser, getUnclaimedInstitutionalLicense, claimInstitutionalBenefit } = useAuth();
  const { setActiveClassroom } = useClassroom();
  
  const role = currentUser?.role || 'TEACHER';
  const [activeTab, setActiveTab] = useState(role === 'ADMIN' ? 'admin' : 'classrooms');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [benefitModalDismissed, setBenefitModalDismissed] = useState(false);

  const unclaimedLic = getUnclaimedInstitutionalLicense(currentUser);
  const showBenefitModal = !benefitModalDismissed && !!unclaimedLic;

  const handleClaimBenefit = async (lic) => {
    await claimInstitutionalBenefit(lic);
    setActiveTab('classrooms');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #f5f7fb 0%, #edf3f7 100%)',
        color: 'var(--text-primary)',
        gap: '1rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #163a5f 0%, #1d4ed8 100%)',
          padding: '1rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 12px 28px rgba(22,58,95,0.14)',
          animation: 'pulse 1.5s infinite'
        }}>
          <Sparkles color="#ffffff" size={36} />
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>Loading your classroom...</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Preparing your workspace</p>
      </div>
    );
  }

  // If user is not logged in, show professional Sign In / Registration page
  if (!currentUser) {
    return <LoginPage />;
  }

  const isTeacher = role === 'TEACHER';
  const isLicensedTeacher = isTeacher ? isProUser(currentUser) : true;

  return (
    <div className="app-container" style={{ flexDirection: 'column' }}>
      <Navbar onNavigateBilling={() => setActiveTab('billing')} />
      
      <div className="app-body" style={{ display: 'flex', flex: 1 }}>
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab === 'classrooms') setSelectedCourse(null);
          }} 
        />
        
        <main className="main-content">
          {/* Unlicensed Teacher Flow: Display Software Details & License Showcase Screen immediately */}
          {isTeacher && !isLicensedTeacher ? (
            <TeacherSoftwareShowcaseView onUnlocked={() => setActiveTab('classrooms')} />
          ) : (
            <>
              {activeTab === 'classrooms' && (
                selectedCourse ? (
                  <ClassroomDetailView 
                    classroom={selectedCourse} 
                    onBack={() => setSelectedCourse(null)} 
                    onNavigateBilling={() => setActiveTab('billing')}
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
                role === 'TEACHER' ? <TeacherReviewView onNavigateBilling={() => setActiveTab('billing')} /> : <StudentTodoView />
              )}

              {activeTab === 'certificates' && (
                role === 'TEACHER' ? <TeacherCertificatesView /> : <CertificateLocker />
              )}

              {activeTab === 'billing' && (
                <TeacherBillingView />
              )}

              {activeTab === 'admin' && (
                <AdminDashboard />
              )}
            </>
          )}
        </main>
      </div>

      {/* Automatic First-Login Institutional Access Benefit Pop-up Modal */}
      <InstitutionalBenefitModal
        isOpen={showBenefitModal}
        onClose={() => setBenefitModalDismissed(true)}
        activeLicense={unclaimedLic}
        onClaim={handleClaimBenefit}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ClassroomProvider>
        <MainLayout />
        <CookieConsentModal />
      </ClassroomProvider>
    </AuthProvider>
  );
}

export default App;
