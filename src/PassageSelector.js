// PassageSelector.js
import React, { useState } from "react";
import HealthBar from "./HealthBar";
import PassageStats from "./PassageStats";

function PassageSelector({
  passages,
  selectPassage,
  deletePassage,
  editPassage,
}) {
  // State to track which passage's stats are being viewed
  const [selectedStatsIndex, setSelectedStatsIndex] = useState(null);

  return (
    <div>
      <h2>Select a Passage to Practice</h2>
      <ul>
        {passages.map((passage, index) => (
          <li
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            {/* Passage Name */}
            <span style={{ flexGrow: 1 }}>{passage.name}</span>

            {/* Health Bar */}
            <HealthBar health={passage.stats?.health || 0} />

            {/* Buttons */}
            <button onClick={() => selectPassage(index)}>Practice</button>
            <button onClick={() => editPassage(index)}>Edit</button>
            <button onClick={() => deletePassage(index)}>Delete</button>
            <button onClick={() => setSelectedStatsIndex(index)}>Stats</button>
          </li>
        ))}
      </ul>

      {/* Display Passage Statistics */}
      {selectedStatsIndex !== null && (
        <PassageStats
          passage={passages[selectedStatsIndex]}
          closeStats={() => setSelectedStatsIndex(null)}
        />
      )}
    </div>
  );
}

export default PassageSelector;
