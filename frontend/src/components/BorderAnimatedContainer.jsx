// BorderAnimatedContainer.jsx
import React from "react";

function BorderAnimatedContainer({ children, className = "" }) {
  return (
    <div className={`bg-transparent ${className}`}>
      {children}
    </div>
  );
}

export default BorderAnimatedContainer;