import React from 'react';
import Avatar from './Avatar';
import RatingStars from './RatingStars';

const StoreItem = ({ store }) => {
  return (
    <div className="flex items-center space-x-4 p-6 hover:bg-gray-50 rounded-2xl cursor-pointer transition-all">
      <Avatar src={store.avatar} size="w-16 h-16" />
      <div className="flex-1">
        <h3 className="font-semibold text-xl text-gray-900">{store.name}</h3>
        <RatingStars rating={store.rating} size="w-5 h-5" />
      </div>
    </div>
  );
};

export default StoreItem;
