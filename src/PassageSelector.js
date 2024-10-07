// PassageSelector.js
import React from "react";

function PassageSelector({ passages, selectPassage, deletePassage }) {
  return (
    <div>
      <h2>Select a Passage to Practice</h2>
      {passages.length === 0 ? (
        <p>No passages saved yet.</p>
      ) : (
        <ul>
          {passages.map((passage, index) => (
            <li key={index} style={{ marginBottom: "10px" }}>
              <strong>{passage.name}</strong>
              <br />
              <button onClick={() => selectPassage(index)}>Practice</button>
              <button onClick={() => deletePassage(index)}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PassageSelector;
