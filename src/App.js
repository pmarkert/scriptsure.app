// App.js
import React, { useState, useEffect, useContext } from "react";
import TextInput from "./TextInput";
import PassageSelector from "./PassageSelector";
import MemorizationPractice from "./MemorizationPractice";
import { ThemeContext } from "./ThemeContext";
import BiblePassageImporter from "./BiblePassageImporter";
import "./index.css";

function App() {
  const [passages, setPassages] = useState([]);
  const [selectedPassageIndex, setSelectedPassageIndex] = useState(null);
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const savedPassages = JSON.parse(localStorage.getItem("passages")) || [];
    setPassages(savedPassages);
  }, []);

  const addPassage = (newPassage) => {
    const updatedPassages = [...passages, newPassage];
    setPassages(updatedPassages);
    localStorage.setItem("passages", JSON.stringify(updatedPassages));
  };

  const selectPassage = (index) => {
    setSelectedPassageIndex(index);
  };

  const deletePassage = (index) => {
    const updatedPassages = passages.filter((_, i) => i !== index);
    setPassages(updatedPassages);
    localStorage.setItem("passages", JSON.stringify(updatedPassages));
  };

  const exitPractice = () => {
    setSelectedPassageIndex(null);
  };

  return (
    <div className="container">
      <button className="toggle-theme-btn" onClick={toggleTheme}>
        Switch to {theme === "light" ? "Dark" : "Light"} Mode
      </button>
      <h1>Memorization App</h1>
      {selectedPassageIndex === null ? (
        <>
          <TextInput addPassage={addPassage} />
          <BiblePassageImporter addPassage={addPassage} />
          <PassageSelector
            passages={passages}
            selectPassage={selectPassage}
            deletePassage={deletePassage}
          />
        </>
      ) : (
        <MemorizationPractice
          passage={passages[selectedPassageIndex].text}
          exitPractice={exitPractice}
        />
      )}
    </div>
  );
}

export default App;
