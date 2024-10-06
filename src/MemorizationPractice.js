// MemorizationPractice.js
import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";

function MemorizationPractice({ passage, exitPractice }) {
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedWords, setRevealedWords] = useState([]);
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);
  const [flashColor, setFlashColor] = useState(null);

  useEffect(() => {
    // Split passage into words, preserving punctuation as separate tokens
    const tokens = passage.match(/[\w']+|[.,!?;:\-\[\]()\d]+/g);
    setWords(tokens);
    setRevealedWords(
      tokens.map((token, index) => (isNonWord(token) ? token : ""))
    );
  }, [passage]);

  const isNonWord = (token) => {
    return /^[^\w']+$/g.test(token);
  };

  const handleInput = (e) => {
    const inputChar = e.key.toLowerCase();
    const currentWord = words[currentIndex];

    if (isNonWord(currentWord)) {
      // Automatically reveal non-word tokens
      revealWord(currentIndex);
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    if (inputChar === currentWord[0].toLowerCase()) {
      revealWord(currentIndex);
      setIncorrectGuesses(0);
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Incorrect guess handling
      setIncorrectGuesses((prev) => prev + 1);
      flashScreen("red");
      if (incorrectGuesses + 1 >= 3) {
        revealWord(currentIndex, true); // Highlight in red
        setIncorrectGuesses(0);
        setCurrentIndex((prev) => prev + 1);
      }
    }
    e.preventDefault();
  };

  const revealWord = (index, highlightIncorrect = false) => {
    setRevealedWords((prev) =>
      prev.map((word, i) =>
        i === index
          ? highlightIncorrect
            ? `<span style="color: red;">${words[i]}</span>`
            : words[i]
          : word
      )
    );
  };

  const flashScreen = (color) => {
    setFlashColor(color);
    setTimeout(() => setFlashColor(null), 200); // Pause input briefly
  };

  useEffect(() => {
    // Focus on the input when component mounts
    document.addEventListener("keydown", handleInput);
    return () => {
      document.removeEventListener("keydown", handleInput);
    };
  });

  const progressPercentage = ((currentIndex / words.length) * 100).toFixed(2);

  return (
    <div
      style={{
        backgroundColor: flashColor || "white",
        transition: "background-color 0.2s",
      }}
    >
      <h2>Memorization Practice</h2>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          minHeight: "100px",
        }}
        dangerouslySetInnerHTML={{ __html: revealedWords.join(" ") }}
      ></div>
      <ProgressBar progress={progressPercentage} />
      <button onClick={exitPractice}>Exit Practice</button>
    </div>
  );
}

export default MemorizationPractice;
