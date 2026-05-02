import React from 'react';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import RatingStars from '../components/RatingStars';
import Button from '../components/Button';
import { orderRequests } from '../data/dummy';

const OrderRequest = () => {
  const handleAccept = (id) => console.log('Accept', id);
  const handleReject = (id) => console.log('Reject', id);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {orderRequests.map((request) => (
        <Card key={request.id} className="shadow-soft hover:shadow-xl transition-all hover:-translate-y-2">
          <div className="flex items-start space-x-4">
            <Avatar src={request.avatar} size="w-16 h-16" />
            <div className="flex-1 pt-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{request.user}</h3>
              <RatingStars rating={request.rating} />
            </div>
          </div>
          <div className="flex space-x-3 mt-6">
            <Button variant="accept" onClick={() => handleAccept(request.id)} className="flex-1">
              Accept
            </Button>
            <Button variant="reject" onClick={() => handleReject(request.id)} className="flex-1">
              Reject
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default OrderRequest;
