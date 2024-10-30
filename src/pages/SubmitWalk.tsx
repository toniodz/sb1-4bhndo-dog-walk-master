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
  data-netlify="true"
  data-netlify-honeypot="bot-field"
  className="space-y-6"
  action="/"
  data-netlify-success-url="https://dogwalksnearme.uk/thank-you"
>
       {/* Hidden fields for Netlify */}
       <input type="hidden" name="form-name" value="walk-submission" />
       <input type="hidden" name="bot-field" />
       <input type="hidden" name="notify" value="tony@dzines.co.uk" />

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
           placeholder="e.g., White Cliffs Coastal Path"
           className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
         />
       </div>

       <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
         <input
           type="text"
           name="location"
           required
           placeholder="e.g., Dover, Kent"
           className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
         />
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
           <input
             type="text"
             name="duration"
             required
             placeholder="e.g., 1-2 hours"
             className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
           />
         </div>

         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
           <select
             name="difficulty"
             required
             className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
           >
             <option value="">Select difficulty</option>
             <option value="Easy">Easy</option>
             <option value="Moderate">Moderate</option>
             <option value="Challenging">Challenging</option>
           </select>
         </div>
       </div>

       <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">Parking Information</label>
         <input
           type="text"
           name="parking"
           required
           placeholder="e.g., Free parking available at..."
           className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
         />
       </div>

       <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
         <textarea
           name="description"
           required
           rows={6}
           placeholder="Please provide details about the walk, including terrain type, dog-friendly features, points of interest, etc."
           className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
         />
       </div>

       <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">Website (if available)</label>
         <input
           type="url"
           name="website"
           placeholder="e.g., https://www.nationaltrust.org.uk/..."
           className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
         />
       </div>

       <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
         <textarea
           name="notes"
           rows={3}
           placeholder="Any additional information you'd like to share..."
           className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
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
