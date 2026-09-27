import React, { useState } from 'react';
import { UserCog, Trash2, CheckCircle2, UserX, Search } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { SearchBox } from '../../components/common/SearchBox';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { fmt, initials } from '../../data/seed';
import { firebaseConfigured, firebaseDeleteStudentProfile, firebaseErrorMessage, firebaseSetStudentActive } from '../../firebase';

export function AdminStudents({ data, updateData, notify }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  const students = (data.students || []).filter((s) => {
    const searchString = `${s.name} ${s.email}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const handleExecuteAction = async () => {
    if (!pendingAction) return;
    const { student, action } = pendingAction;

    if (action === 'delete') {
      try {
        if (firebaseConfigured) {
          await firebaseDeleteStudentProfile(student.id);
        } else {
          updateData('students', data.students.filter((s) => s.id !== student.id));
        }
      } catch (error) {
        notify(firebaseErrorMessage(error), 'error');
        return;
      }
      notify(`Student account for "${student.name}" was deleted. Ticket history retained.`);
    } else if (action === 'deactivate') {
      try {
        if (firebaseConfigured) await firebaseSetStudentActive(student.id, false);
        if (!firebaseConfigured) {
          updateData('students', data.students.map((s) =>
            s.id === student.id ? { ...s, active: false } : s
          ));
        }
      } catch (error) {
        notify(firebaseErrorMessage(error), 'error');
        return;
      }
      notify(`Student account for "${student.name}" was deactivated.`);
    } else if (action === 'reactivate') {
      try {
        if (firebaseConfigured) await firebaseSetStudentActive(student.id, true);
        if (!firebaseConfigured) {
          updateData('students', data.students.map((s) =>
            s.id === student.id ? { ...s, active: true } : s
          ));
        }
      } catch (error) {
        notify(firebaseErrorMessage(error), 'error');
        return;
      }
      notify(`Student account for "${student.name}" was reactivated.`);
    }

    setPendingAction(null);
  };

  return (
    <div className="page-container admin-students-page">
      <PageHeader
        eyebrow="Account Administration"
        title="Registered Student Accounts"
        description="Review student directory records, verification states, account activation, and access management."
      />

      <div className="toolbar-strip">
        <SearchBox
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search students by name or email address..."
          onClear={() => setSearchTerm('')}
        />
      </div>

      <section className="panel table-panel">
        <div className="admin-student-table-header">
          <span className="col-student-info">Student Profile</span>
          <span className="col-reg-date">Registration Date</span>
          <span className="col-verification">Verification</span>
          <span className="col-account-status">Access Status</span>
          <span className="col-student-actions">Actions</span>
        </div>

        {students.length > 0 ? (
          <div className="admin-table-body">
            {students.map((student) => {
              const isActive = student.active !== false;
              return (
                <div className="admin-student-row" key={student.id}>
                  <div className="col-student-info">
                    <div className="student-row-avatar">{initials(student.name)}</div>
                    <div>
                      <strong className="student-name">{student.name}</strong>
                    </div>
                  </div>

                  <div className="col-reg-date">
                    <span>{fmt(student.createdAt)}</span>
                  </div>

                  <div className="col-verification">
                    <span className={`badge-pill ${student.verified ? 'badge-verified' : 'badge-unverified'}`}>
                      {student.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>

                  <div className="col-account-status">
                    <span className={`status-pill ${isActive ? 'resolved' : 'closed'}`}>
                      {isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </div>

                  <div className="col-student-actions">
                    <button
                      type="button"
                      className="button button-sm button-secondary"
                      onClick={() =>
                        setPendingAction({
                          student,
                          action: isActive ? 'deactivate' : 'reactivate'
                        })
                      }
                    >
                      {isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                    <button
                      type="button"
                      className="icon-button button-danger-icon"
                      onClick={() =>
                        setPendingAction({
                          student,
                          action: 'delete'
                        })
                      }
                      aria-label={`Delete account for ${student.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<UserCog size={24} />}
            title="No students found"
            text="Try adjusting your name or email search term."
          />
        )}
      </section>

      {pendingAction && (
        <ConfirmDialog
          title={
            pendingAction.action === 'delete'
              ? `Delete ${pendingAction.student.name}'s Account?`
              : `${pendingAction.action === 'deactivate' ? 'Deactivate' : 'Reactivate'} ${
                  pendingAction.student.name
                }?`
          }
          text={
            pendingAction.action === 'delete'
              ? firebaseConfigured
                ? 'This deletes the student Firestore profile. Their Firebase sign-in remains, but they will not be able to access the portal. All ticket conversations will be retained.'
                : 'This removes the student from the local demo directory. All past ticket conversations will be retained for audit purposes.'
              : pendingAction.action === 'deactivate'
              ? 'This will prevent the student from logging into the portal until an administrator reactivates their account.'
              : 'This restores immediate portal access for the student.'
          }
          confirmLabel={
            pendingAction.action === 'delete'
              ? 'Delete Account'
              : pendingAction.action === 'deactivate'
              ? 'Deactivate'
              : 'Reactivate'
          }
          isDanger={pendingAction.action === 'delete' || pendingAction.action === 'deactivate'}
          action={handleExecuteAction}
          onClose={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}
