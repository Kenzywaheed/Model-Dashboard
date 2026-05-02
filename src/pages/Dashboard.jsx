import React, { useState } from 'react';
import './Dashboard.css';

const ChartPlaceholder = ({ color, points }) => {
  return (
    <div className="chart-placeholder">
      <svg viewBox="0 0 100 40" className="chart-svg">
        <path 
          d={`M 0 ${40 - points[0]} ${points.map((p, i) => `L ${i * (100 / (points.length - 1))} ${40 - p}`).join(' ')}`} 
          fill="none" 
          stroke={color} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
    </div>
  );
};

const Dashboard = () => {
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Last 30 Days');
  
  const [candidates, setCandidates] = useState([
    { id: 1, name: 'Sarah Wilson', role: 'UX Designer', rating: 5, checked: true },
    { id: 2, name: 'Michael Chen', role: 'Frontend Dev', rating: 4, checked: false },
    { id: 3, name: 'Emily Davis', role: 'Product Manager', rating: 5, checked: true },
    { id: 4, name: 'James Smith', role: 'Backend Dev', rating: 4, checked: false },
    { id: 5, name: 'Olivia Brown', role: 'Data Scientist', rating: 5, checked: true },
    { id: 6, name: 'William Jones', role: 'DevOps', rating: 4, checked: false },
    { id: 7, name: 'Sophia Miller', role: 'UI Designer', rating: 5, checked: true },
    { id: 8, name: 'Liam Garcia', role: 'Full Stack Dev', rating: 4, checked: false },
    { id: 9, name: 'Isabella Martinez', role: 'QA Engineer', rating: 5, checked: true }
  ]);

  const handleGenerateReport = () => {
    alert("Report generation started. You will be notified when it is ready.");
  };

  const toggleCandidate = (id) => {
    setCandidates(prev => prev.map(c => 
      c.id === id ? { ...c, checked: !c.checked } : c
    ));
  };

  const selectFilter = (filter) => {
    setSelectedFilter(filter);
    setFilterDropdownOpen(false);
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="h1">Dashboard</h1>
        <div className="header-actions">
          <div style={{ position: 'relative' }}>
            <button 
              className="btn btn-outline" 
              onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
            >
              {selectedFilter} ▾
            </button>
            {filterDropdownOpen && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => selectFilter('Today')}>Today</button>
                <button className="dropdown-item" onClick={() => selectFilter('Last 7 Days')}>Last 7 Days</button>
                <button className="dropdown-item" onClick={() => selectFilter('Last 30 Days')}>Last 30 Days</button>
                <button className="dropdown-item" onClick={() => selectFilter('This Year')}>This Year</button>
              </div>
            )}
          </div>
          <button className="btn btn-primary" onClick={handleGenerateReport}>+ Generate Report</button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-main">
          <div className="grid grid-cols-2 gap-6">
            <div className="card stat-card">
              <div className="stat-header">
                <h3 className="h3">Total Users</h3>
                <span className="badge badge-success">+5%</span>
              </div>
              <div className="stat-value">12.3k</div>
              <ChartPlaceholder color="var(--primary-color)" points={[10, 15, 8, 25, 20, 30, 25]} />
            </div>
            <div className="card stat-card">
              <div className="stat-header">
                <h3 className="h3">Revenue</h3>
                <span className="badge badge-success">+15%</span>
              </div>
              <div className="stat-value">$12.4k</div>
              <ChartPlaceholder color="var(--success-color)" points={[15, 10, 20, 15, 30, 25, 35]} />
            </div>
          </div>
          
          <div className="card mt-6 main-chart-card">
            <div className="chart-header">
              <h3 className="h3">Activity Overview</h3>
              <div className="chart-legend">
                <span className="legend-item"><span className="dot primary"></span>Users</span>
                <span className="legend-item"><span className="dot success"></span>Revenue</span>
              </div>
            </div>
            <div className="chart-body">
              <div className="bar-chart">
                {[40, 60, 30, 80, 50, 70, 90, 60, 45, 85, 55, 75].map((val, i) => (
                  <div key={i} className="bar-group">
                    <div className="bar primary-bar" style={{ height: `${val}%` }}></div>
                    <div className="bar success-bar" style={{ height: `${val * 0.7}%` }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="card list-card">
            <div className="list-header">
              <h3 className="h3">Top Candidates</h3>
              <button className="btn-icon" onClick={() => alert("Options clicked")}>⋮</button>
            </div>
            <ul className="candidate-list">
              {candidates.map((candidate) => (
                <li key={candidate.id} className="candidate-item">
                  <div className="candidate-info">
                    <input 
                      type="checkbox" 
                      className="custom-checkbox" 
                      checked={candidate.checked} 
                      onChange={() => toggleCandidate(candidate.id)} 
                    />
                    <div className="candidate-details">
                      <div className={`candidate-name ${candidate.checked ? 'checked-item' : ''}`}>
                        {candidate.name}
                      </div>
                    </div>
                  </div>
                  <div className="candidate-rating">
                    {'★'.repeat(candidate.rating)}{'☆'.repeat(5 - candidate.rating)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
