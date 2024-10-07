// ProgressBar.js
import React from "react";

function ProgressBar({ progress }) {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p>{progress}% Complete</p>
    </div>
  );
}

export default ProgressBar;
