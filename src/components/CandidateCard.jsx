import React, { useState } from 'react';
import './CandidateCard.css';

const CandidateCard = ({ candidate, onAction }) => {
  const [isFading, setIsFading] = useState(false);

  const handleActionClick = (action) => {
    setIsFading(true);
    if (onAction) {
      onAction(candidate.id, action);
    }
  };

  return (
    <div className={`card candidate-card-large ${isFading ? 'fade-out' : ''}`}>
      <div className="candidate-card-header">
        <img 
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=e2e8f0&color=475569&size=64`} 
          alt={candidate.name} 
          className="avatar avatar-lg" 
        />
        <div className="candidate-card-info">
          <h4 className="candidate-card-name">{candidate.name}</h4>
          <div className="candidate-card-rating">
            {'★'.repeat(candidate.rating)}{'☆'.repeat(5 - candidate.rating)}
          </div>
        </div>
      </div>
      
      <div className="candidate-card-actions">
        <button className="btn btn-success btn-full" onClick={() => handleActionClick('accept')}>Accept</button>
        <button className="btn btn-danger btn-full" onClick={() => handleActionClick('reject')}>Reject</button>
      </div>
    </div>
  );
};

export default CandidateCard;
