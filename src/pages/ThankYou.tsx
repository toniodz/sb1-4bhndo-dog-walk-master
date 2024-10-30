// src/pages/ThankYou.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const ThankYou: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-6">Thank You!</h1>
      <p className="text-xl mb-8">
        Your walk submission has been received. We'll review it shortly.
      </p>
      <div className="space-y-4">
        <Link 
          to="/" 
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-90"
        >
          Return Home
        </Link>
        <br />
        <Link 
          to="/submit-walk" 
          className="inline-block text-primary hover:underline"
        >
          Submit Another Walk
        </Link>
      </div>
    </div>
  );
};

export default ThankYou;
