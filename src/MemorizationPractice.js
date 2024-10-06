// MemorizationPractice.js
import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";

function MemorizationPractice({ passage, exitPractice }) {
  const [segments, setSegments] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealedSegments, setRevealedSegments] = useState([]);
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);
  const [flashColor, setFlashColor] = useState(null);

  useEffect(() => {
    const tokenizePassage = (passage) => {
      let segments = [];
      let regex = /\b\w+\b[^\w\s]*/g;
      let match;
      let lastIndex = 0;

      while ((match = regex.exec(passage)) !== null) {
        let start = match.index;
        let end = regex.lastIndex;

        if (start > lastIndex) {
          let preText = passage.slice(lastIndex, start);
          segments.push({ type: "pre", text: preText });
        }

        let word = match[0];
        segments.push({ type: "word", text: word });

        lastIndex = end;
      }

      if (lastIndex < passage.length) {
        let preText = passage.slice(lastIndex);
        segments.push({ type: "pre", text: preText });
      }

      return segments;
    };

    const processedSegments = tokenizePassage(passage);
    setSegments(processedSegments);

    const initialRevealedSegments = processedSegments.map((segment) =>
      segment.type === "pre" ? segment.text : ""
    );
    setRevealedSegments(initialRevealedSegments);
    setCurrentIndex(0);
    setIncorrectGuesses(0);
  }, [passage]);

  const handleInput = (e) => {
    const inputChar = e.key.toLowerCase();

    if (!/^[a-zA-Z]$/.test(inputChar)) {
      return;
    }

    let index = currentIndex;
    while (index < segments.length && segments[index].type !== "word") {
      index++;
    }

    if (index >= segments.length) {
      return;
    }

    const currentWordSegment = segments[index];
    const firstLetter = currentWordSegment.text[0].toLowerCase();

    if (inputChar === firstLetter) {
      setRevealedSegments((prev) =>
        prev.map((seg, i) => (i === index ? currentWordSegment.text : seg))
      );
      setIncorrectGuesses(0);
      setCurrentIndex(index + 1);
    } else {
      setIncorrectGuesses((prev) => prev + 1);
      flashScreen("red");
      if (incorrectGuesses + 1 >= 3) {
        setRevealedSegments((prev) =>
          prev.map((seg, i) =>
            i === index
              ? `<span style="color: red;">${currentWordSegment.text}</span>`
              : seg
          )
        );
        setIncorrectGuesses(0);
        setCurrentIndex(index + 1);
      }
    }
    e.preventDefault();
  };

  const flashScreen = (color) => {
    setFlashColor(color);
    setTimeout(() => setFlashColor(null), 200);
  };

  useEffect(() => {
    document.addEventListener("keydown", handleInput);
    return () => {
      document.removeEventListener("keydown", handleInput);
    };
  });

  const totalWords = segments.filter(
    (segment) => segment.type === "word"
  ).length;
  const revealedWords = revealedSegments.filter(
    (seg, index) => segments[index].type === "word" && seg !== ""
  ).length;
  const progressPercentage = ((revealedWords / totalWords) * 100).toFixed(2);

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
        dangerouslySetInnerHTML={{ __html: revealedSegments.join("") }}
      ></div>
      <ProgressBar progress={progressPercentage} />
      <button onClick={exitPractice}>Exit Practice</button>
    </div>
  );
}

export default MemorizationPractice;
