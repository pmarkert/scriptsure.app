// MemorizationPractice.js
import React, { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";

function MemorizationPractice({ passage, exitPractice }) {
  const [segments, setSegments] = useState([]);
  const [revealedSegments, setRevealedSegments] = useState([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);
  const [flashColor, setFlashColor] = useState(null);

  useEffect(() => {
    const tokenizePassage = (content) => {
      const segments = [];
      let currentIndex = 0;

      const patterns = {
        heading: /^(?<hashes>#+)\s*(?<headingText>[^\n]*)(?<newline>\n?)/m,
        verseNumber: /^(?<verseNumber>\d+\.)/,
        word: /^(?<word>[a-zA-Z]+(?:['’\-][a-zA-Z]+)*)/,
        punctuation: /^(?<punctuation>[^\s\w]+)/,
        whitespace: /^(?<whitespace>\s+)/,
        newline: /^(?<newline>\n)/,
      };

      while (currentIndex < content.length) {
        const substring = content.slice(currentIndex);

        // Heading
        const headingMatch = substring.match(patterns.heading);
        if (headingMatch) {
          const { hashes, headingText, newline } = headingMatch.groups;
          const level = hashes.length;
          segments.push({
            type: "heading",
            text: headingText.trim() + (newline || ""),
            level: level,
          });
          currentIndex += headingMatch[0].length;
          continue;
        }

        // Verse Number
        const verseNumberMatch = substring.match(patterns.verseNumber);
        if (verseNumberMatch) {
          const { verseNumber } = verseNumberMatch.groups;
          segments.push({ type: "punctuation", text: verseNumber });
          currentIndex += verseNumber.length;
          continue;
        }

        // Word
        const wordMatch = substring.match(patterns.word);
        if (wordMatch) {
          const { word } = wordMatch.groups;
          segments.push({ type: "word", text: word });
          currentIndex += word.length;
          continue;
        }

        // Punctuation
        const punctuationMatch = substring.match(patterns.punctuation);
        if (punctuationMatch) {
          const { punctuation } = punctuationMatch.groups;
          segments.push({ type: "punctuation", text: punctuation });
          currentIndex += punctuation.length;
          continue;
        }

        // Whitespace
        const whitespaceMatch = substring.match(patterns.whitespace);
        if (whitespaceMatch) {
          const { whitespace } = whitespaceMatch.groups;
          segments.push({ type: "whitespace", text: whitespace });
          currentIndex += whitespace.length;
          continue;
        }

        // Newline
        const newlineMatch = substring.match(patterns.newline);
        if (newlineMatch) {
          const { newline } = newlineMatch.groups;
          segments.push({ type: "newline", text: newline });
          currentIndex += newline.length;
          continue;
        }

        // Unknown character
        segments.push({ type: "unknown", text: substring[0] });
        currentIndex += 1;
      }

      return segments;
    };

    const processedSegments = tokenizePassage(passage);
    setSegments(processedSegments);

    // All segments are initially hidden
    const initialRevealedSegments = processedSegments.map(() => "");
    setRevealedSegments(initialRevealedSegments);
    setCurrentSegmentIndex(0);
    setIncorrectGuesses(0);
  }, [passage]);

  useEffect(() => {
    // Reveal non-guessable segments starting from currentSegmentIndex
    if (segments.length === 0) return;

    let index = currentSegmentIndex;
    let updatedRevealedSegments = [...revealedSegments];
    let indexChanged = false;

    while (index < segments.length && segments[index].type !== "word") {
      const segment = segments[index];
      if (segment.type === "heading") {
        // Render heading without '#' and apply appropriate heading level
        updatedRevealedSegments[
          index
        ] = `<h${segment.level} class="heading">${segment.text}</h${segment.level}>`;
      } else {
        updatedRevealedSegments[index] = segment.text;
      }
      index += 1;
      indexChanged = true;
    }
    if (indexChanged) {
      setRevealedSegments(updatedRevealedSegments);
      setCurrentSegmentIndex(index);
    }
  }, [currentSegmentIndex, segments, revealedSegments]);

  const handleInput = (e) => {
    const inputChar = e.key.toLowerCase();

    if (!/^[a-zA-Z]$/.test(inputChar)) {
      return;
    }

    let index = currentSegmentIndex;

    if (index >= segments.length) {
      return;
    }

    const segment = segments[index];

    if (segment.type === "word") {
      const firstLetter = segment.text[0].toLowerCase();

      if (inputChar === firstLetter) {
        // Correct guess; reveal the word
        setRevealedSegments((prev) => {
          const updated = [...prev];
          updated[index] = segment.text;
          return updated;
        });
        setIncorrectGuesses(0);
        setCurrentSegmentIndex(index + 1);
      } else {
        // Incorrect guess handling
        setIncorrectGuesses((prev) => prev + 1);
        flashScreen("red");

        if (incorrectGuesses + 1 >= 3) {
          // Reveal the word highlighted in red
          setRevealedSegments((prev) => {
            const updated = [...prev];
            updated[index] = `<span style="color: red;">${segment.text}</span>`;
            return updated;
          });
          setIncorrectGuesses(0);
          setCurrentSegmentIndex(index + 1);
        }
      }
      e.preventDefault();
    }
  };

  const flashScreen = (color) => {
    setFlashColor(color);
    setTimeout(() => setFlashColor(null), 200);
  };

  useEffect(() => {
    const keyDownHandler = (e) => handleInput(e);
    document.addEventListener("keydown", keyDownHandler);
    return () => {
      document.removeEventListener("keydown", keyDownHandler);
    };
  }, [currentSegmentIndex, incorrectGuesses]);

  const totalWords = segments.filter(
    (segment) => segment.type === "word"
  ).length;
  const revealedWords = revealedSegments.filter(
    (text, i) => segments[i].type === "word" && text !== ""
  ).length;
  const progressPercentage =
    totalWords > 0 ? ((revealedWords / totalWords) * 100).toFixed(2) : 0;

  return (
    <div
      style={{
        backgroundColor: flashColor || "transparent",
        transition: "background-color 0.2s",
      }}
    >
      <h2>Memorization Practice</h2>
      <div
        className="passage-display"
        dangerouslySetInnerHTML={{ __html: revealedSegments.join("") }}
      ></div>
      <ProgressBar progress={progressPercentage} />
      <button onClick={exitPractice}>Exit Practice</button>
    </div>
  );
}

export default MemorizationPractice;
