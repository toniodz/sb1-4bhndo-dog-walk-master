// src/pages/SubmitWalk.tsx
import React from 'react';

const SubmitWalk: React.FC = () => {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    
    try {
      const formData = new FormData(form);
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString(),
      });
      
      // Redirect on success
      window.location.href = '/thank-you';
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Submit a Dog Walk</h1>
      <p className="mb-6 text-gray-600">Share your favorite dog walking route with our community.</p>

      <form 
        name="walk-submission"
        onSubmit={handleSubmit}
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        className="space-y-6"
      >
        {/* Rest of your form code stays the same */}
        {/* ... */}
      </form>
    </div>
  );
};

export default SubmitWalk;
