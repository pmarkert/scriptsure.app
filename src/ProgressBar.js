// ProgressBar.js
import React from "react";

function ProgressBar({ progress }) {
  return (
    <div style={{ marginTop: "10px" }}>
      <div
        style={{
          backgroundColor: "#ccc",
          width: "100%",
          height: "20px",
          borderRadius: "5px",
        }}
      >
        <div
          style={{
            backgroundColor: "#4caf50",
            width: `${progress}%`,
            height: "100%",
            borderRadius: "5px",
            transition: "width 0.2s",
          }}
        ></div>
      </div>
      <p>{progress}% completed</p>
    </div>
  );
}

export default ProgressBar;
