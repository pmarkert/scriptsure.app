// App.js
import React, { useState } from "react";
import TextInput from "./TextInput";
import PassageSelector from "./PassageSelector";
import MemorizationPractice from "./MemorizationPractice";

function App() {
  const [passages, setPassages] = useState([]);
  const [selectedPassageIndex, setSelectedPassageIndex] = useState(null);

  const addPassage = (text) => {
    setPassages([...passages, text]);
  };

  const selectPassage = (index) => {
    setSelectedPassageIndex(index);
  };

  const exitPractice = () => {
    setSelectedPassageIndex(null);
  };

  return (
    <div>
      <h1>Memorization App</h1>
      {selectedPassageIndex === null ? (
        <>
          <TextInput addPassage={addPassage} />
          <PassageSelector passages={passages} selectPassage={selectPassage} />
        </>
      ) : (
        <MemorizationPractice
          passage={passages[selectedPassageIndex]}
          exitPractice={exitPractice}
        />
      )}
    </div>
  );
}

export default App;
