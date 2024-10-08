// HealthBar.js
import React from "react";

function HealthBar({ health }) {
  const barColor =
    health > 75
      ? "green"
      : health > 50
      ? "yellow"
      : health > 25
      ? "orange"
      : "red";

  return (
    <div
      style={{
        width: "100px",
        height: "10px",
        backgroundColor: "#ddd",
        margin: "0 10px",
        borderRadius: "5px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${health}%`,
          height: "100%",
          backgroundColor: barColor,
          transition: "width 0.3s",
        }}
      ></div>
    </div>
  );
}

export default HealthBar;
