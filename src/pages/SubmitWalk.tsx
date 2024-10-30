// src/pages/SubmitWalk.tsx
import React from 'react';

const SubmitWalk: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Submit a Dog Walk</h1>
      <p className="mb-6 text-gray-600">Share your favorite dog walking route with our community.</p>

      <form 
        name="walk-submission"
        method="POST"
        netlify
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Walk Title</label>
            <input
              type="text"
              name="walk-title"
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors duration-200"
          >
            Submit Walk
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitWalk;
