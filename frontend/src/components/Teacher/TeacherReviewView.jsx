import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { AIGradingReviewer } from './AIGradingReviewer';
import { 
  FileCheck, 
  Sparkles, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';

export const TeacherReviewView = () => {
  const { classrooms, assignments, submissions } = useClassroom();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('to-review'); // 'to-review' | 'reviewed'
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const teacherId = currentUser?.id || '';
  const teacherClassrooms = (classrooms || []).filter(c => c.teacherId === teacherId);
  const teacherClassroomIds = teacherClassrooms.map(c => c.id);

  const teacherAssignments = (assignments || []).filter(a => teacherClassroomIds.includes(a.classroomId));
  const teacherAssignmentIds = teacherAssignments.map(a => a.id);

  const teacherSubmissions = (submissions || []).filter(s => teacherAssignmentIds.includes(s.assignmentId));

  const toReviewList = teacherSubmissions.filter(s => s.status === 'PENDING_REVIEW' || s.status === 'FLAGGED_PLAGIARISM' || s.isBelowThreshold);
  const reviewedList = teacherSubmissions.filter(s => s.status === 'FINALIZED');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileCheck color="var(--accent-purple)" size={24} /> To Review Hub
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Review pending student submissions, AI grade suggestions, and finalize gradebook records across your courses.
          </p>
        </div>

        {/* 2 Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setActiveTab('to-review')} 
            className={`btn btn-sm ${activeTab === 'to-review' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: '0.4rem' }}
          >
            <Sparkles size={14} /> To Review ({toReviewList.length})
          </button>

          <button 
            onClick={() => setActiveTab('reviewed')} 
            className={`btn btn-sm ${activeTab === 'reviewed' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: '0.4rem' }}
          >
            <CheckCircle2 size={14} /> Reviewed ({reviewedList.length})
          </button>
        </div>
      </div>

      {/* Tab 1: To Review */}
      {activeTab === 'to-review' && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {toReviewList.length === 0 ? (
            <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem 1rem' }}>
              <CheckCircle2 size={48} color="var(--status-success)" style={{ margin: '0 auto 1rem display' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>All caught up!</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>There are no student submissions waiting for evaluation.</p>
            </div>
          ) : (
            toReviewList.map(sub => {
              const asg = teacherAssignments.find(a => a.id === sub.assignmentId);
              const cls = teacherClassrooms.find(c => c.id === asg?.classroomId);

              return (
                <div key={sub.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span className="badge badge-warning">PENDING REVIEW</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cls?.name}</span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.2rem' }}>{sub.studentName}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 600, marginBottom: '0.75rem' }}>
                      Assignment: {asg?.title || 'Coursework'}
                    </p>

                    <div style={{ background: 'var(--bg-secondary)', padding: '0.65rem 0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>Submitted:</span>
                        <strong>{new Date(sub.submittedAt).toLocaleString()}</strong>
                      </div>
                      {sub.aiSuggestedGrade !== null && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-purple)', fontWeight: 700 }}>
                          <span>AI Suggested Score:</span>
                          <span>{sub.aiSuggestedGrade} / {asg?.maximumMarks}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedSubmission({ submission: sub, assignment: asg })}
                    className="btn btn-primary" 
                    style={{ width: '100%', gap: '0.4rem' }}
                  >
                    <Sparkles size={16} /> Review & Grade with AI
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Reviewed */}
      {activeTab === 'reviewed' && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {reviewedList.length === 0 ? (
            <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem 1rem' }}>
              <Clock size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem display' }} />
              <h4 style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>No finalized reviews yet</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Graded student assignments will appear here.</p>
            </div>
          ) : (
            reviewedList.map(sub => {
              const asg = teacherAssignments.find(a => a.id === sub.assignmentId);
              const cls = teacherClassrooms.find(c => c.id === asg?.classroomId);

              return (
                <div key={sub.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span className="badge badge-success">GRADED / FINALIZED</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cls?.name}</span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.2rem' }}>{sub.studentName}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--accent-purple)', fontWeight: 600, marginBottom: '0.75rem' }}>
                      Assignment: {asg?.title || 'Coursework'}
                    </p>

                    <div style={{ background: 'var(--bg-secondary)', padding: '0.65rem 0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>Final Grade:</span>
                        <strong style={{ color: 'var(--status-success)', fontSize: '0.9rem' }}>{sub.teacherFinalGrade} / {asg?.maximumMarks}</strong>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedSubmission({ submission: sub, assignment: asg })}
                    className="btn btn-secondary" 
                    style={{ width: '100%', gap: '0.4rem' }}
                  >
                    <Eye size={16} /> View Evaluation
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* AI Reviewer Modal */}
      {selectedSubmission && (
        <AIGradingReviewer 
          submission={selectedSubmission.submission} 
          assignment={selectedSubmission.assignment} 
          isOpen={!!selectedSubmission} 
          onClose={() => setSelectedSubmission(null)} 
        />
      )}

    </div>
  );
};
