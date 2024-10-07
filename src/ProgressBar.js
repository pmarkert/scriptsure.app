// ProgressBar.js
import React from "react";

function ProgressBar({ progress, missed }) {
  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${progress}%` }}
        ></div>
        <div
          className="progress-bar-missed"
          style={{ width: `${missed}%` }}
        ></div>
      </div>
    </div>
  );
}

export default ProgressBar;
