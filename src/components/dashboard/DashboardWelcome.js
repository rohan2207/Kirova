import React from 'react';

const DashboardWelcome = ({ name, totalSaved = 0 }) => {
  return (
    <div className="py-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        👋 Hi, {name || 'there'}!
      </h1>
      <p className="text-gray-600">
        We've found grocery deals around you. {totalSaved > 0 && `You've saved $${totalSaved.toFixed(2)} so far!`}
      </p>
      
      <div className="mt-6 flex">
        <div className="relative flex-1 max-w-xl">
          <input 
            type="text"
            placeholder="Search for groceries, stores, or deals..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
          <span className="absolute left-3 top-3 text-gray-400">
            🔍
          </span>
        </div>
        
        <button className="ml-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-sm hover:bg-green-700 transition-colors">
          Make a List
        </button>
      </div>
    </div>
  );
};

export default DashboardWelcome;