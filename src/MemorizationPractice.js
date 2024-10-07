// MemorizationPractice.js
import React, { useState, useEffect, useRef } from "react";
import ProgressBar from "./ProgressBar";

function MemorizationPractice({ passage, exitPractice }) {
  const [segments, setSegments] = useState([]);
  const [revealedSegments, setRevealedSegments] = useState([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);
  const [flashColor, setFlashColor] = useState(null);
  const [spaceBarPressed, setSpaceBarPressed] = useState(false);

  // Refs to hold the latest state values
  const currentSegmentIndexRef = useRef(currentSegmentIndex);
  const incorrectGuessesRef = useRef(incorrectGuesses);
  const segmentsRef = useRef(segments);
  const revealedSegmentsRef = useRef(revealedSegments);
  const savedRevealedSegmentsRef = useRef([]);

  useEffect(() => {
    // Update refs when state changes
    currentSegmentIndexRef.current = currentSegmentIndex;
    incorrectGuessesRef.current = incorrectGuesses;
    segmentsRef.current = segments;
    revealedSegmentsRef.current = revealedSegments;
  }, [currentSegmentIndex, incorrectGuesses, segments, revealedSegments]);

  useEffect(() => {
    const tokenizePassage = (content) => {
      const segments = [];
      let currentIndex = 0;

      const patterns = {
        heading: /^(?<hashes>#+)\s*(?<headingText>[^\n]*)(?<newline>\n?)/m,
        verseNumber: /^(?<verseNumber>\d+\.)/,
        newline: /^(?<newline>\n)/,
        word: /^(?<word>[a-zA-Z]+(?:['’\-][a-zA-Z]+)*)/,
        punctuation: /^(?<punctuation>[^\s\w]+)/,
        whitespace: /^(?<whitespace>[ \t]+)/,
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

        // Newline
        const newlineMatch = substring.match(patterns.newline);
        if (newlineMatch) {
          const { newline } = newlineMatch.groups;
          segments.push({ type: "newline", text: newline });
          currentIndex += newline.length;
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

    // Update refs
    currentSegmentIndexRef.current = 0;
    incorrectGuessesRef.current = 0;
    segmentsRef.current = processedSegments;
    revealedSegmentsRef.current = initialRevealedSegments;
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

      // Update refs
      currentSegmentIndexRef.current = index;
      revealedSegmentsRef.current = updatedRevealedSegments;
    }
  }, [currentSegmentIndex, segments, revealedSegments]);

  const flashScreen = (color) => {
    setFlashColor(color);
    setTimeout(() => setFlashColor(null), 200);
  };

  useEffect(() => {
    const keyDownHandler = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setSpaceBarPressed(true);
      } else {
        const inputChar = e.key.toLowerCase();

        if (!/^[a-zA-Z]$/.test(inputChar)) {
          return;
        }

        let index = currentSegmentIndexRef.current;

        if (index >= segmentsRef.current.length) {
          return;
        }

        const segment = segmentsRef.current[index];

        if (segment.type === "word") {
          const firstLetter = segment.text[0].toLowerCase();

          if (inputChar === firstLetter) {
            // Correct guess; reveal the word
            setRevealedSegments((prev) => {
              const updated = [...prev];
              updated[index] = segment.text;
              revealedSegmentsRef.current = updated;
              return updated;
            });
            setIncorrectGuesses(0);
            currentSegmentIndexRef.current = index + 1;
            setCurrentSegmentIndex(index + 1);
          } else {
            // Incorrect guess handling
            setIncorrectGuesses((prev) => prev + 1);
            incorrectGuessesRef.current += 1;
            flashScreen("red");

            if (incorrectGuessesRef.current >= 3) {
              // Reveal the word highlighted in red
              setRevealedSegments((prev) => {
                const updated = [...prev];
                updated[
                  index
                ] = `<span style="color: red;">${segment.text}</span>`;
                revealedSegmentsRef.current = updated;
                return updated;
              });
              setIncorrectGuesses(0);
              incorrectGuessesRef.current = 0;
              currentSegmentIndexRef.current = index + 1;
              setCurrentSegmentIndex(index + 1);
            }
          }
          e.preventDefault();
        }
      }
    };

    const keyUpHandler = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setSpaceBarPressed(false);
      }
    };

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
      document.removeEventListener("keyup", keyUpHandler);
    };
  }, []);

  useEffect(() => {
    if (spaceBarPressed) {
      // Save the current revealedSegments if not already saved
      if (savedRevealedSegmentsRef.current.length === 0) {
        savedRevealedSegmentsRef.current = [...revealedSegmentsRef.current];
      }

      // Show hints up to the end of the current line
      let index = currentSegmentIndexRef.current;
      const updatedRevealedSegments = [...revealedSegmentsRef.current];

      // Find the end of the current line
      while (
        index < segmentsRef.current.length &&
        segmentsRef.current[index].type !== "newline"
      ) {
        const segment = segmentsRef.current[index];
        if (updatedRevealedSegments[index] === "") {
          if (segment.type === "word") {
            updatedRevealedSegments[
              index
            ] = `<span style="color: gray;">${segment.text}</span>`;
          } else {
            updatedRevealedSegments[index] = segment.text;
          }
        }
        index++;
      }

      setRevealedSegments(updatedRevealedSegments);
      revealedSegmentsRef.current = updatedRevealedSegments;
    } else {
      // Restore the previous revealedSegments
      if (savedRevealedSegmentsRef.current.length > 0) {
        setRevealedSegments(savedRevealedSegmentsRef.current);
        revealedSegmentsRef.current = savedRevealedSegmentsRef.current;
        savedRevealedSegmentsRef.current = [];
      }
    }
  }, [spaceBarPressed]);

  const totalWords = segments.length
    ? segments.filter((segment) => segment.type === "word").length
    : 0;
  const revealedWords = revealedSegments.filter(
    (text, i) =>
      segments[i].type === "word" &&
      text !== "" &&
      !text.includes("color: gray;")
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
