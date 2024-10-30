// src/pages/SubmitWalk.tsx
import React, { useState } from 'react';

const SubmitWalk: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    walkTitle: '',
    location: '',
    duration: '',
    difficulty: 'Easy',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailBody = `
New Walk Submission

From: ${formData.name}
Email: ${formData.email}

Walk Details:
Title: ${formData.walkTitle}
Location: ${formData.location}
Duration: ${formData.duration}
Difficulty: ${formData.difficulty}

Description:
${formData.description}
    `.trim();

    window.location.href = `mailto:contact@dogwalksnearme.uk?subject=New Walk Submission - ${formData.walkTitle}&body=${encodeURIComponent(emailBody)}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Submit a Dog Walk</h1>
      <p className="mb-6 text-gray-600">Share your favorite dog walking route with our community.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
            <input
              type="text"
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
            <input
              type="email"
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Walk Title</label>
          <input
            type="text"
            required
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            value={formData.walkTitle}
            onChange={e => setFormData(prev => ({ ...prev, walkTitle: e.target.value }))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            type="text"
            required
            placeholder="e.g., White Cliffs of Dover"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            value={formData.location}
            onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
            <input
              type="text"
              required
              placeholder="e.g., 1-2 hours"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              value={formData.duration}
              onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              value={formData.difficulty}
              onChange={e => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
            >
              <option value="Easy">Easy</option>
              <option value="Moderate">Moderate</option>
              <option value="Challenging">Challenging</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            required
            rows={6}
            placeholder="Please provide details about the walk, including parking information, terrain, dog-friendly features, etc."
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-opacity-90 transition-colors duration-200"
        >
          Submit Walk
        </button>

        <p className="text-sm text-gray-500 text-center">
          Thank you for contributing to our community! We'll review your submission and get back to you soon.
        </p>
      </form>
    </div>
  );
};

export default SubmitWalk;
