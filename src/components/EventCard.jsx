import React from 'react';

const EventCard = ({ event }) => {
  return (
    <div className={`p-4 rounded-xl ${event.color} shadow-soft`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-medium">{event.time}</div>
          <div className="font-semibold mt-1">{event.title}</div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
