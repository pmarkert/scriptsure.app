// PassageStats.js
import React from "react";

function PassageStats({ passage, closeStats }) {
  const { stats } = passage;

  return (
    <div>
      <h3>Statistics for {passage.name}</h3>
      <p>Health: {stats.health}%</p>
      <p>Last Practiced: {new Date(stats.lastPracticed).toLocaleString()}</p>
      <h4>Practice Sessions:</h4>
      <ul>
        {stats.practices.map((practice, index) => (
          <li key={index}>
            Date: {new Date(practice.date).toLocaleString()}, Score:{" "}
            {practice.score}%, Errors: {practice.errors}, Hints Used:{" "}
            {practice.hintsUsed}
          </li>
        ))}
      </ul>
      <button onClick={closeStats}>Close</button>
    </div>
  );
}

export default PassageStats;
