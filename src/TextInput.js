// TextInput.js
import React, { useState } from "react";

function TextInput({ addPassage }) {
  const [text, setText] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = () => {
    if (text.trim() && name.trim()) {
      addPassage({ name: name.trim(), text: text.trim() });
      setText("");
      setName("");
    } else {
      alert("Please provide both a name and text for the passage.");
    }
  };

  return (
    <div>
      <h2>Add a New Passage</h2>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Passage Name"
      />
      <br />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder="Paste your text here"
      />
      <br />
      <button onClick={handleSubmit}>Save Passage</button>
    </div>
  );
}

export default TextInput;
