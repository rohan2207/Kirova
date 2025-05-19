import React from 'react';

export default function SavingsCard({ label, value, bgColor, textColor }) {
  return (
    <div className={`p-6 rounded-xl shadow-md ${bgColor} ${textColor}`}>
      <h4 className="text-md font-semibold mb-1">{label}</h4>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
