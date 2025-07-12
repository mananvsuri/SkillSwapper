import React from 'react';

const Badge = ({ label }: { label: string }) => {
  return (
    <span className="px-2 py-1 text-sm rounded bg-gray-200 text-gray-800">
      {label}
    </span>
  );
};

export default Badge;
