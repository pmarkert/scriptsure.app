// PassageSelector.js
import React from "react";

function PassageSelector({ passages, selectPassage }) {
  return (
    <div>
      <h2>Select a Passage to Practice</h2>
      <ul>
        {passages.map((passage, index) => (
          <li key={index}>
            <button onClick={() => selectPassage(index)}>
              Passage {index + 1}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PassageSelector;
