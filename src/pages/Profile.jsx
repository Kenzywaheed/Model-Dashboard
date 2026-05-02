import React from 'react';
import './Profile.css';

const Profile = () => {
  return (
    <div className="profile-container">
      <div className="profile-header card">
        <div className="profile-cover"></div>
        <div className="profile-info-section">
          <img 
            src="https://ui-avatars.com/api/?name=Admin&background=4f46e5&color=fff&size=128" 
            alt="Admin" 
            className="profile-avatar" 
          />
          <div className="profile-details">
            <h1 className="h1">Admin User</h1>
            <p className="text-muted">System Administrator</p>
          </div>
          <div className="profile-actions">
            <button className="btn btn-primary" onClick={() => alert("Edit Profile Modal opened!")}>Edit Profile</button>
            <button className="btn btn-outline" onClick={() => alert("Settings Modal opened!")}>Settings</button>
          </div>
        </div>
      </div>

      <div className="profile-content grid grid-cols-3 gap-6 mt-6">
        <div className="profile-sidebar card">
          <h3 className="h3 mb-4">About</h3>
          <p className="text-muted mb-4">
            Administrator of the Model Dashboard. Responsible for managing users, candidates, and system settings.
          </p>
          <ul className="info-list">
            <li className="info-item">
              <span className="info-label">Email:</span>
              <span className="info-value">admin@modeldashboard.com</span>
            </li>
            <li className="info-item">
              <span className="info-label">Location:</span>
              <span className="info-value">New York, USA</span>
            </li>
            <li className="info-item">
              <span className="info-label">Joined:</span>
              <span className="info-value">January 2026</span>
            </li>
          </ul>
        </div>
        
        <div className="profile-main col-span-2">
          <div className="card mb-6">
            <h3 className="h3 mb-4">Recent Activity</h3>
            <div className="placeholder-box"></div>
            <div className="placeholder-box"></div>
            <div className="placeholder-box"></div>
          </div>
          <div className="card">
            <h3 className="h3 mb-4">Performance Metrics</h3>
            <div className="placeholder-box large"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
