// PassageSelector.js
import React from "react";

function PassageSelector({
  passages,
  selectPassage,
  deletePassage,
  editPassage,
}) {
  return (
    <div>
      <h2>Select a Passage to Practice</h2>
      <ul>
        {passages.map((passage, index) => (
          <li key={index}>
            {passage.name}
            <button onClick={() => selectPassage(index)}>Practice</button>
            <button onClick={() => editPassage(index)}>Edit</button>
            <button onClick={() => deletePassage(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PassageSelector;
