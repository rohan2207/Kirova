import React from 'react';

const GroceryCategories = () => {
  const categories = [
    { id: 'eggs', label: 'Eggs', icon: '🥚' },
    { id: 'milk', label: 'Milk', icon: '🥛' },
    { id: 'cake', label: 'Cake', icon: '🎂' },
    { id: 'flowers', label: 'Flowers', icon: '💐' },
    { id: 'wine', label: 'Wine', icon: '🍷' },
    { id: 'beer', label: 'Beer', icon: '🍺' },
    { id: 'chicken', label: 'Chicken', icon: '🍗' },
    { id: 'bread', label: 'Bread', icon: '🍞' },
  ];

  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
      {categories.map(category => (
        <button
          key={category.id}
          className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
        >
          <span className="text-3xl mb-2">{category.icon}</span>
          <span className="text-sm text-gray-700">{category.label}</span>
        </button>
      ))}
    </div>
  );
};

export default GroceryCategories;