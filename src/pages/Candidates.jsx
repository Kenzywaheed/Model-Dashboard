import React, { useState } from 'react';
import CandidateCard from '../components/CandidateCard';

const initialCandidates = [
  { id: 1, name: 'Alice Johnson', rating: 4 },
  { id: 2, name: 'Bob Smith', rating: 5 },
  { id: 3, name: 'Charlie Brown', rating: 3 },
  { id: 4, name: 'Diana Prince', rating: 5 },
  { id: 5, name: 'Evan Wright', rating: 4 },
  { id: 6, name: 'Fiona Gallagher', rating: 4 },
  { id: 7, name: 'George Martin', rating: 5 },
  { id: 8, name: 'Hannah Abbott', rating: 3 },
];

const Candidates = () => {
  const [candidatesData, setCandidatesData] = useState(initialCandidates);

  const handleAction = (id, action) => {
    // In a real app, this would make an API call
    // Here we just remove the candidate with a slight delay for animation
    setTimeout(() => {
      setCandidatesData(prev => prev.filter(c => c.id !== id));
    }, 300); // 300ms matches the CSS transition time
  };

  const handleAddCandidate = () => {
    const newName = prompt("Enter new candidate name:");
    if (newName) {
      const newCandidate = {
        id: Date.now(),
        name: newName,
        rating: Math.floor(Math.random() * 3) + 3 // Random rating 3-5
      };
      setCandidatesData([newCandidate, ...candidatesData]);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="h1">Candidates</h1>
        <button className="btn btn-primary" onClick={handleAddCandidate}>
          + Add Candidate
        </button>
      </div>

      {candidatesData.length === 0 ? (
        <div className="empty-state text-center py-12 text-muted">
          <h3 className="h3 mb-2">No candidates found</h3>
          <p>All candidates have been reviewed or none exist yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {candidatesData.map(candidate => (
            <CandidateCard 
              key={candidate.id} 
              candidate={candidate} 
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Candidates;
