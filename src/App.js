// App.js
import React, { useState, useEffect, useContext } from "react";
import TextInput from "./TextInput";
import PassageSelector from "./PassageSelector";
import MemorizationPractice from "./MemorizationPractice";
import { ThemeContext } from "./ThemeContext";
import "./index.css";

function App() {
  const [passages, setPassages] = useState([]);
  const [selectedPassageIndex, setSelectedPassageIndex] = useState(null);

  // Load passages from localStorage on component mount
  useEffect(() => {
    const storedPassages = localStorage.getItem("passages");
    if (storedPassages) {
      setPassages(JSON.parse(storedPassages));
    }
  }, []);

  // Save passages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("passages", JSON.stringify(passages));
  }, [passages]);

  const addPassage = (passage) => {
    setPassages([...passages, passage]);
  };

  const selectPassage = (index) => {
    setSelectedPassageIndex(index);
  };

  const deletePassage = (index) => {
    const updatedPassages = passages.filter((_, i) => i !== index);
    setPassages(updatedPassages);
  };

  const exitPractice = () => {
    setSelectedPassageIndex(null);
  };

  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="container">
      <button className="toggle-theme-btn" onClick={toggleTheme}>
        Switch to {theme === "light" ? "Dark" : "Light"} Mode
      </button>
      <h1>Memorization App</h1>
      {selectedPassageIndex === null ? (
        <>
          <TextInput addPassage={addPassage} />
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
