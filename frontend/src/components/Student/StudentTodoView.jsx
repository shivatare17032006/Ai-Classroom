import React, { useState } from 'react';
import { useClassroom } from '../../context/ClassroomContext';
import { useAuth } from '../../context/AuthContext';
import { SubmitAssignmentModal } from './SubmitAssignmentModal';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  UploadCloud, 
  BookOpen, 
  Calendar 
} from 'lucide-react';

export const StudentTodoView = () => {
  const { classrooms, assignments, submissions, extensions } = useClassroom();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' | 'missing' | 'done'
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const studentId = currentUser?.id || '';
  const enrolledClassrooms = (classrooms || []).filter(c => Array.isArray(c.studentIds) && c.studentIds.includes(studentId));
  const enrolledClassroomIds = enrolledClassrooms.map(c => c.id);

  const studentAssignments = (assignments || []).filter(a => enrolledClassroomIds.includes(a.classroomId));

  const now = new Date();

  // Categorization Logic
  const assignedList = [];
  const missingList = [];
  const doneList = [];

  studentAssignments.forEach(asg => {
    const sub = (submissions || []).find(s => s.assignmentId === asg.id && s.studentId === studentId);
    const ext = (extensions || []).find(e => e.assignmentId === asg.id && e.studentId === studentId);
    const dueDate = ext ? new Date(ext.extendedDueDate) : new Date(asg.dueDate);
    const classroom = enrolledClassrooms.find(c => c.id === asg.classroomId);

    const item = { assignment: asg, submission: sub, extension: ext, dueDate, classroom };

    if (sub) {
      doneList.push(item);
    } else if (now > dueDate) {
      missingList.push(item);
    } else {
      assignedList.push(item);
    }
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckSquare color="var(--accent-indigo)" size={24} /> To-do Hub
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Track your assigned coursework, overdue assignments, and submitted solutions across all enrolled courses.
          </p>
        </div>

        {/* 3 Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setActiveTab('assigned')} 
            className={`btn btn-sm ${activeTab === 'assigned' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: '0.4rem' }}
          >
            <Clock size={14} /> Assigned ({assignedList.length})
          </button>

          <button 
            onClick={() => setActiveTab('missing')} 
            className={`btn btn-sm ${activeTab === 'missing' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: '0.4rem' }}
          >
            <AlertTriangle size={14} /> Missing ({missingList.length})
          </button>

          <button 
            onClick={() => setActiveTab('done')} 
            className={`btn btn-sm ${activeTab === 'done' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ gap: '0.4rem' }}
          >
            <CheckCircle2 size={14} /> Done ({doneList.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Assigned */}
      {activeTab === 'assigned' && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {assignedList.length === 0 ? (
            <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem 1rem' }}>
              <CheckCircle2 size={48} color="var(--status-success)" style={{ margin: '0 auto 1rem display' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Woohoo, no work due soon!</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>You have submitted all pending coursework for your enrolled classes.</p>
            </div>
          ) : (
            assignedList.map(({ assignment: asg, extension: ext, dueDate, classroom }) => (
              <div key={asg.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>{classroom?.name || 'Classroom'}</span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>{asg.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                    {asg.description}
                  </p>

                  <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Due Date:</span>
                      <strong style={{ color: 'var(--accent-blue)' }}>{dueDate.toLocaleString()}</strong>
                    </div>
                    {ext && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-purple)', marginTop: '0.2rem', fontWeight: 700 }}>
                        <span>Personal Extension:</span>
                        <span>{new Date(ext.extendedDueDate).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedAssignment(asg)}
                  className="btn btn-primary" 
                  style={{ width: '100%', gap: '0.4rem' }}
                >
                  <UploadCloud size={16} /> Submit Solution
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Missing */}
      {activeTab === 'missing' && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {missingList.length === 0 ? (
            <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem 1rem' }}>
              <CheckCircle2 size={48} color="var(--status-success)" style={{ margin: '0 auto 1rem display' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No missing assignments</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Great job keeping up with deadlines!</p>
            </div>
          ) : (
            missingList.map(({ assignment: asg, dueDate, classroom }) => (
              <div key={asg.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span className="badge badge-danger">MISSING / OVERDUE</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{classroom?.name}</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>{asg.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                    {asg.description}
                  </p>

                  <div style={{ background: 'var(--status-danger-bg)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--status-danger)' }}>
                      <span>Was Due:</span>
                      <strong>{dueDate.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedAssignment(asg)}
                  className="btn btn-danger" 
                  style={{ width: '100%', gap: '0.4rem' }}
                >
                  <UploadCloud size={16} /> Hand In Late Solution
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Done */}
      {activeTab === 'done' && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {doneList.length === 0 ? (
            <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem 1rem' }}>
              <Clock size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem display' }} />
              <h4 style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>No completed assignments yet</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Submitted coursework will appear here.</p>
            </div>
          ) : (
            doneList.map(({ assignment: asg, submission: sub, classroom }) => (
              <div key={asg.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span className="badge badge-success">SUBMITTED</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{classroom?.name}</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem' }}>{asg.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                    {asg.description}
                  </p>

                  <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Submitted On:</span>
                      <strong>{new Date(sub.submittedAt).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedAssignment(asg)}
                  className="btn btn-secondary" 
                  style={{ width: '100%', gap: '0.4rem' }}
                >
                  <UploadCloud size={16} /> Resubmit Work
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Submission Modal */}
      {selectedAssignment && (
        <SubmitAssignmentModal 
          assignment={selectedAssignment} 
          isOpen={!!selectedAssignment} 
          onClose={() => setSelectedAssignment(null)} 
        />
      )}

    </div>
  );
};
