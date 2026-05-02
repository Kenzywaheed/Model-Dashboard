import React, { useState } from 'react';
import './Calendar.css';

const Calendar = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 15)); // May 2026
  
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  const handleToday = () => {
    setCurrentDate(new Date()); // Go to actual today
  };

  const dates = Array.from({ length: 35 }, (_, i) => i - 2); // Simple mock calendar

  return (
    <div className="calendar-container">
      <div className="calendar-main card">
        <div className="calendar-header">
          <h2 className="h2">{months[currentMonth]} {currentYear}</h2>
          <div className="calendar-actions">
            <button className="btn btn-outline" onClick={handlePrevMonth}>&lt;</button>
            <button className="btn btn-outline" onClick={handleToday}>Today</button>
            <button className="btn btn-outline" onClick={handleNextMonth}>&gt;</button>
          </div>
        </div>
        
        <div className="calendar-grid">
          {days.map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}
          
          {dates.map((date, i) => {
            const isCurrentMonth = date > 0 && date <= 31;
            const isToday = currentMonth === 4 && currentYear === 2026 && date === 15; // Hardcoded mock today
            
            return (
              <div key={i} className={`calendar-day ${!isCurrentMonth ? 'inactive' : ''} ${isToday ? 'today' : ''}`}>
                <span className="date-number">{isCurrentMonth ? date : (date <= 0 ? 30 + date : date - 31)}</span>
                
                {/* Mock Events (Only show if we are on May 2026) */}
                {currentMonth === 4 && currentYear === 2026 && (
                  <>
                    {date === 5 && <div className="event event-primary">Project Meeting</div>}
                    {date === 12 && <div className="event event-success">Client Call</div>}
                    {date === 18 && <div className="event event-danger">Deadline</div>}
                    {date === 22 && <div className="event event-secondary">Team Lunch</div>}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="calendar-sidebar">
        <div className="card map-card">
          <h3 className="h3 mb-4">Location</h3>
          <div className="map-placeholder">
            <img src="https://via.placeholder.com/400x300?text=Map+View" alt="Map" className="map-img" />
          </div>
          <div className="location-info mt-4">
            <h4 className="font-semibold">Main Office</h4>
            <p className="text-muted text-sm">123 Tech Avenue, Innovation City</p>
          </div>
        </div>
        
        <div className="card upcoming-events-card mt-6">
          <h3 className="h3 mb-4">Upcoming</h3>
          <ul className="event-list">
            <li className="event-list-item">
              <div className="event-time">10:00 AM</div>
              <div className="event-details">
                <div className="event-title">Daily Standup</div>
                <div className="event-desc">Engineering Team</div>
              </div>
            </li>
            <li className="event-list-item">
              <div className="event-time">02:30 PM</div>
              <div className="event-details">
                <div className="event-title">Design Review</div>
                <div className="event-desc">Product Team</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
