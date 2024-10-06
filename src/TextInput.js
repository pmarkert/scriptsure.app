// TextInput.js
import React, { useState } from "react";

function TextInput({ addPassage }) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (text.trim()) {
      addPassage(text.trim());
      setText("");
    }
  };

  return (
    <div>
      <h2>Add a New Passage</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        cols={50}
        placeholder="Paste your text here"
      />
      <br />
      <button onClick={handleSubmit}>Save Passage</button>
    </div>
  );
}

export default TextInput;
