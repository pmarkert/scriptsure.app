// App.js
import React, { useState, useEffect, useContext } from "react";
import TextInput from "./TextInput";
import PassageSelector from "./PassageSelector";
import MemorizationPractice from "./MemorizationPractice";
import { ThemeContext } from "./ThemeContext";
import BiblePassageImporter from "./BiblePassageImporter";
import "./style.css";
import { calculateHealth } from "./utils";

function App() {
  const [passages, setPassages] = useState([]);
  const [selectedPassageIndex, setSelectedPassageIndex] = useState(null);
  const [showImporter, setShowImporter] = useState(false);
  const [passageToEdit, setPassageToEdit] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const savedPassages = JSON.parse(localStorage.getItem("passages")) || [];
    setPassages(savedPassages);
  }, []);

  useEffect(() => {
    const savedPassages = JSON.parse(localStorage.getItem("passages")) || [];

    // Update health ratings based on time decay
    const updatedPassages = savedPassages.map((passage) => {
      if (passage.stats) {
        const newHealth = calculateHealth(passage.stats, { score: 0 });
        passage.stats.health = newHealth;
      }
      return passage;
    });

    setPassages(updatedPassages);
    localStorage.setItem("passages", JSON.stringify(updatedPassages));
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

  const editPassage = (index) => {
    setPassageToEdit(passages[index]);
    setEditIndex(index);
  };

  const updatePassage = (updatedPassage) => {
    const updatedPassages = [...passages];
    updatedPassages[editIndex] = updatedPassage;
    setPassages(updatedPassages);
    localStorage.setItem("passages", JSON.stringify(updatedPassages));
    // Reset editing state
    setPassageToEdit(null);
    setEditIndex(null);
  };

  const updatePassageStats = (passageName, practiceStats, newHealth) => {
    const updatedPassages = passages.map((passage) => {
      if (passage.name === passageName) {
        // Update stats
        const updatedStats = {
          ...passage.stats,
          lastPracticed: practiceStats.date,
          practices: [...(passage.stats?.practices || []), practiceStats],
          health: newHealth,
        };
        return { ...passage, stats: updatedStats };
      }
      return passage;
    });
    setPassages(updatedPassages);
    localStorage.setItem("passages", JSON.stringify(updatedPassages));
  };

  const cancelEdit = () => {
    setPassageToEdit(null);
    setEditIndex(null);
  };

  const exportPassages = () => {
    const passagesJSON = JSON.stringify(passages);
    navigator.clipboard.writeText(passagesJSON).then(() => {
      alert("Passages copied to clipboard");
    });
  };

  const importPassages = () => {
    navigator.clipboard.readText().then((text) => {
      try {
        const importedPassages = JSON.parse(text);
        if (Array.isArray(importedPassages)) {
          setPassages(importedPassages);
          localStorage.setItem("passages", JSON.stringify(importedPassages));
          alert("Passages imported successfully");
        } else {
          alert("Invalid format: Expected an array of passages");
        }
      } catch (error) {
        alert("Failed to import passages: Invalid JSON");
      }
    });
  };

  return (
    <div className="container">
      <button className="toggle-theme-btn" onClick={toggleTheme}>
        Switch to {theme === "light" ? "Dark" : "Light"} Mode
      </button>
      <h1>Scriptsure.app Memorization</h1>
      {selectedPassageIndex === null ? (
        <>
          <button onClick={exportPassages}>Export</button>
          <button onClick={importPassages}>Import</button>
          {!showImporter ? (
            <>
              <TextInput
                addPassage={addPassage}
                passageToEdit={passageToEdit}
                updatePassage={updatePassage}
                cancelEdit={cancelEdit}
              />
              {!passageToEdit && (
                <button onClick={openImporter}>Import Passage</button>
              )}
              <PassageSelector
                passages={passages}
                selectPassage={selectPassage}
                deletePassage={deletePassage}
                editPassage={editPassage}
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
          passage={passages[selectedPassageIndex]}
          exitPractice={exitPractice}
          updatePassageStats={updatePassageStats}
        />
      )}
    </div>
  );
}

export default App;

