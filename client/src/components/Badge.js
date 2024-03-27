import React from "react";

const Badge = () => {
  return (
    <div className="relative top-0 left-0">
      <div className="bg-badge h-3 w-3 rounded-full animate-ping" />
      <div className="bg-badge h-3 w-3 rounded-full absolute top-0 left-0" />
    </div>
  );
};

export default Badge;
