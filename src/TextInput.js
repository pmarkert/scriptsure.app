// TextInput.js
import React, { useState, useEffect } from "react";

function TextInput({ addPassage, passageToEdit, updatePassage, cancelEdit }) {
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    if (passageToEdit) {
      setName(passageToEdit.name);
      setText(passageToEdit.text);
    } else {
      setName("");
      setText("");
    }
  }, [passageToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim() === "" || text.trim() === "") {
      alert("Please enter a name and text for the passage.");
      return;
    }

    if (passageToEdit) {
      updatePassage({ name: name.trim(), text: text.trim() });
    } else {
      addPassage({ name: name.trim(), text: text.trim() });
    }

    setName("");
    setText("");
  };

  return (
    <div>
      <h2>{passageToEdit ? "Edit Passage" : "Add New Passage"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Passage Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          placeholder="Passage Text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
        ></textarea>
        <button type="submit">
          {passageToEdit ? "Save Changes" : "Add Passage"}
        </button>
        {passageToEdit && <button onClick={cancelEdit}>Cancel</button>}
      </form>
    </div>
  );
}

export default TextInput;
