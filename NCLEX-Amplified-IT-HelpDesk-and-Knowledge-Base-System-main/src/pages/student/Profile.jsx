import React, { useRef, useState } from 'react';
import { UserRound, CheckCircle2, Pencil, Check, Mail, Shield, Phone, MapPin, KeyRound, UserX, Trash2, Camera } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { initials } from '../../data/seed';
import { firebaseChangePassword, firebaseConfigured } from '../../firebase';

export function Profile({ session, updateSession, updateData, data, notify, setConfirm, logout }) {
  const [mode, setMode] = useState(null);
  const [displayName, setDisplayName] = useState(session.name || '');
  const [details, setDetails] = useState({
    phone: session.phone || '',
    address: session.address || ''
  });
  const [passwordForm, setPasswordForm] = useState({ password: '', confirm: '' });
  const photoInputRef = useRef(null);

  const isAdmin = session.role === 'admin';

  const handleSave = (e) => {
    e.preventDefault();
    const val = displayName.trim();
    if (val.length < 2) {
      notify('Display name must contain at least 2 characters.', 'error');
      return;
    }
    if (details.phone && !/^(09\d{9}|\+639\d{9})$/.test(details.phone.trim())) {
      notify('Enter a valid Philippine mobile number in 09XXXXXXXXX or +639XXXXXXXXX format.', 'error');
      return;
    }

    updateSession({ name: val, ...details });
    if (!isAdmin) {
      updateData('students', (data.students || []).map((student) =>
        student.email.toLowerCase() === session.email.toLowerCase()
          ? { ...student, name: val, ...details }
          : student
      ));
    }
    setMode(null);
    notify('Account details updated successfully.');
  };

  const updateDetail = (event) => {
    setDetails((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    if (passwordForm.password.length < 8) {
      notify('Password must contain at least 8 characters.', 'error');
      return;
    }
    if (passwordForm.password !== passwordForm.confirm) {
      notify('Password confirmation does not match.', 'error');
      return;
    }

    try {
      if (firebaseConfigured) {
        await firebaseChangePassword(passwordForm.password);
      }
      updateSession({ passwordUpdatedAt: new Date().toISOString() });
      setPasswordForm({ password: '', confirm: '' });
      setMode(null);
      notify('Password changed successfully.');
    } catch (error) {
      notify(error.message || 'Password could not be changed.', 'error');
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('Please choose an image file.', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      notify('Profile photos must be 2 MB or smaller.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const profilePhoto = reader.result;
      updateSession({ profilePhoto });
      if (!isAdmin) {
        updateData('students', (data.students || []).map((student) =>
          student.email.toLowerCase() === session.email.toLowerCase()
            ? { ...student, profilePhoto }
            : student
        ));
      }
      notify('Profile photo updated successfully.');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const removePhoto = () => {
    updateSession({ profilePhoto: null });
    if (!isAdmin) {
      updateData('students', (data.students || []).map((student) =>
        student.email.toLowerCase() === session.email.toLowerCase()
          ? { ...student, profilePhoto: null }
          : student
      ));
    }
    notify('Profile photo restored to initials.');
  };

  const confirmAccountAction = (action) => {
    const isDelete = action === 'delete';
    setConfirm({
      title: isDelete ? 'Delete Your Account?' : 'Deactivate Your Account?',
      text: isDelete
        ? 'This removes your student profile from the local account directory. Existing ticket history will be retained, but you will need to register again to access the portal.'
        : 'This signs you out and prevents access to this student account until it is reactivated by an administrator.',
      confirmLabel: isDelete ? 'Delete Account' : 'Deactivate Account',
      isDanger: true,
      action: () => {
        if (isDelete) {
          updateData('students', (data.students || []).filter(
            (student) => student.email.toLowerCase() !== session.email.toLowerCase()
          ));
          notify('Your student account was deleted.');
        } else {
          updateData('students', (data.students || []).map((student) =>
            student.email.toLowerCase() === session.email.toLowerCase()
              ? { ...student, active: false }
              : student
          ));
          notify('Your student account was deactivated.');
        }
        setConfirm(null);
        logout();
      },
      onClose: () => setConfirm(null)
    });
  };

  return (
    <div className="page-container profile-page">
      <PageHeader
        eyebrow="Account Settings"
        title="Profile &amp; Credentials"
        description="Review your account authorization, security status, and personal details."
      />

      <div className="profile-layout-grid">
        <aside className="panel profile-card-panel">
          <button
            type="button"
            className="profile-card-avatar-button"
            onClick={() => photoInputRef.current?.click()}
            title="Change profile photo"
          >
            {session.profilePhoto ? (
              <img src={session.profilePhoto} alt="Profile" className="profile-card-avatar-image" />
            ) : (
              <span className="profile-card-avatar">{initials(session.name)}</span>
            )}
            <span className="profile-photo-edit"><Camera size={14} /></span>
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handlePhotoChange}
          />
          {session.profilePhoto && (
            <button type="button" className="link-button profile-photo-remove" onClick={removePhoto}>
              Remove Photo
            </button>
          )}
          <h2 className="profile-card-name">{session.name}</h2>
          <span className="profile-card-role-badge">
            {isAdmin ? 'Operations Administrator' : 'Verified Student'}
          </span>
          <div className="profile-card-status">
            <CheckCircle2 size={16} className="text-success" />
            <span>Email Verified</span>
          </div>
        </aside>

        <section className="panel profile-details-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">Personal Information</span>
              <h2 className="panel-title">Account Details</h2>
            </div>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setMode((current) => current === 'details' ? null : 'details')}
            >
              <Pencil size={15} /> {mode === 'details' ? 'Cancel' : 'Edit Details'}
            </button>
          </div>

          {mode === 'details' && (
            <form onSubmit={handleSave} className="profile-edit-form">
              <label className="field">
                <span className="field-label">Display Name</span>
                <input
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={80}
                  placeholder="Enter your full name"
                />
              </label>
              {!isAdmin && (
                <>
                  <label className="field">
                    <span className="field-label">Contact Number</span>
                    <input name="phone" value={details.phone} onChange={updateDetail} placeholder="09XXXXXXXXX or +639XXXXXXXXX" inputMode="tel" />
                  </label>
                  <label className="field">
                    <span className="field-label">Address</span>
                    <input name="address" value={details.address} onChange={updateDetail} placeholder="City, state or province" />
                  </label>
                </>
              )}
              <button type="submit" className="button button-primary">
                <Check size={16} /> Save Changes
              </button>
            </form>
          )}

          {mode === 'password' && (
            <form onSubmit={handlePasswordSave} className="profile-edit-form password-edit-form">
              <p className="account-actions-text">Choose a new password for your student portal account.</p>
              <label className="field">
                <span className="field-label">New Password</span>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={passwordForm.password}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="At least 8 characters"
                />
              </label>
              <label className="field">
                <span className="field-label">Confirm New Password</span>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={passwordForm.confirm}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, confirm: event.target.value }))}
                  placeholder="Re-enter your new password"
                />
              </label>
              <div className="profile-form-actions">
                <button type="button" className="button button-secondary" onClick={() => setMode(null)}>Cancel</button>
                <button type="submit" className="button button-primary"><Check size={16} /> Save Password</button>
              </div>
            </form>
          )}

          {!mode && <div className="profile-fields-list">
            <div className="profile-field-row">
              <span className="field-title">
                <UserRound size={16} /> Full Name
              </span>
              <strong className="field-val">{session.name}</strong>
            </div>

            <div className="profile-field-row">
              <span className="field-title">
                <Mail size={16} /> Registered Email
              </span>
              <strong className="field-val">{session.email}</strong>
            </div>

            <div className="profile-field-row">
              <span className="field-title">
                <Shield size={16} /> Role Authorization
              </span>
              <strong className="field-val">
                {isAdmin ? 'System Administrator' : 'Standard Student Account'}
              </strong>
            </div>

            <div className="profile-field-row">
              <span className="field-title">
                <CheckCircle2 size={16} /> Account Status
              </span>
              <span className="status-pill resolved">Active &amp; Compliant</span>
            </div>

            {!isAdmin && (
              <>
                <div className="profile-field-row">
                  <span className="field-title">
                    <Phone size={16} /> Contact Number
                  </span>
                  <strong className="field-val">{session.phone || 'Not provided'}</strong>
                </div>

                <div className="profile-field-row">
                  <span className="field-title">
                    <MapPin size={16} /> Address
                  </span>
                  <strong className="field-val">{session.address || 'Not provided'}</strong>
                </div>

                <button type="button" className="profile-field-row profile-action-row" onClick={() => setMode('password')}>
                  <span className="field-title">
                    <KeyRound size={16} /> Change Password
                  </span>
                  <span className="link-button">Update password</span>
                </button>
              </>
            )}
          </div>}

          {!mode && !isAdmin && (
            <div className="account-actions">
              <div>
                <span className="panel-eyebrow">Account Control</span>
                <p className="account-actions-text">Manage your portal access and student profile.</p>
              </div>
              <div className="account-actions-buttons">
                <button type="button" className="button button-secondary" onClick={() => confirmAccountAction('deactivate')}>
                  <UserX size={16} /> Deactivate Account
                </button>
                <button type="button" className="button button-danger" onClick={() => confirmAccountAction('delete')}>
                  <Trash2 size={16} /> Delete Account
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
