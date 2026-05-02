import React from 'react';
import Avatar from './Avatar';
import RatingStars from './RatingStars';

const ChatItem = ({ chat }) => {
  return (
    <div className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
      <Avatar src={chat.avatar} size="w-14 h-14" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 truncate">{chat.user}</h3>
          <span className="text-xs text-gray-500 ml-2">{chat.time}</span>
        </div>
        <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
        {chat.unread > 0 && (
          <span className="inline-block w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center mt-1">
            {chat.unread}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatItem;
