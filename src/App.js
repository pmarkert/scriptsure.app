// App.js
import React, { useState, useEffect, useContext } from "react";
import TextInput from "./TextInput";
import PassageSelector from "./PassageSelector";
import MemorizationPractice from "./MemorizationPractice";
import { ThemeContext } from "./ThemeContext";
import BiblePassageImporter from "./BiblePassageImporter";
import "./style.css";

function App() {
  const [passages, setPassages] = useState([]);
  const [selectedPassageIndex, setSelectedPassageIndex] = useState(null);
  const [showImporter, setShowImporter] = useState(false);
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

  const openImporter = () => {
    setShowImporter(true);
  };

  const closeImporter = () => {
    setShowImporter(false);
  };

  return (
    <div className="container">
      <button className="toggle-theme-btn" onClick={toggleTheme}>
        Switch to {theme === "light" ? "Dark" : "Light"} Mode
      </button>
      <h1>Memorization App</h1>
      {selectedPassageIndex === null ? (
        <>
          {!showImporter ? (
            <>
              <TextInput addPassage={addPassage} />
              <button onClick={openImporter}>Import Passage</button>
              <PassageSelector
                passages={passages}
                selectPassage={selectPassage}
                deletePassage={deletePassage}
              />
            </>
          ) : (
            <BiblePassageImporter
              addPassage={addPassage}
              closeImporter={closeImporter}
            />
          )}
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
