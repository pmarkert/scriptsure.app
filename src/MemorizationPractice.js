// MemorizationPractice.js
import React, { useState, useEffect, useRef } from "react";
import ProgressBar from "./ProgressBar";
import { calculateHealth } from "./utils";

function MemorizationPractice({ passage, exitPractice, updatePassageStats }) {
  const [segments, setSegments] = useState([]);
  const [revealedSegments, setRevealedSegments] = useState([]);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [incorrectGuesses, setIncorrectGuesses] = useState(0);
  const [flashColor, setFlashColor] = useState(null);
  const [spaceBarPressed, setSpaceBarPressed] = useState(false);

  // New state variables for scoring
  const [totalPoints, setTotalPoints] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [missedPoints, setMissedPoints] = useState(0);

  // Refs to hold the latest state values
  const currentSegmentIndexRef = useRef(currentSegmentIndex);
  const incorrectGuessesRef = useRef(incorrectGuesses);
  const segmentsRef = useRef(segments);
  const revealedSegmentsRef = useRef(revealedSegments);
  const savedRevealedSegmentsRef = useRef([]);
  const earnedPointsRef = useRef(earnedPoints);
  const missedPointsRef = useRef(missedPoints);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (currentSegmentIndex >= segments.length && segments.length > 0) {
      // Practice session completed
      const practiceStats = {
        date: new Date().toISOString(),
        completion: 100, // Since the user completed the passage
        score: ((earnedPoints / totalPoints) * 100).toFixed(2),
        errors: missedPoints,
        hintsUsed: hintsUsedRef.current,
      };

      // Calculate new health rating
      const newHealth = calculateHealth(passage.stats, practiceStats);

      // Update passage stats
      updatePassageStats(passage.name, practiceStats, newHealth);

      // Optionally, display a summary or navigate back to the main screen
      exitPractice();
    }
  }, [
    currentSegmentIndex,
    earnedPoints,
    exitPractice,
    passage.name,
    passage.stats,
    missedPoints,
    totalPoints,
    updatePassageStats,
    segments,
  ]);

  // Track hints used
  const hintsUsedRef = useRef(0);

  useEffect(() => {
    if (spaceBarPressed) {
      hintsUsedRef.current += 1;
    }
  }, [spaceBarPressed]);

  useEffect(() => {
    // Update refs when state changes
    currentSegmentIndexRef.current = currentSegmentIndex;
    incorrectGuessesRef.current = incorrectGuesses;
    segmentsRef.current = segments;
    revealedSegmentsRef.current = revealedSegments;
    earnedPointsRef.current = earnedPoints;
    missedPointsRef.current = missedPoints;
  }, [
    currentSegmentIndex,
    incorrectGuesses,
    segments,
    revealedSegments,
    earnedPoints,
    missedPoints,
  ]);

  useEffect(() => {
    const tokenizePassage = (content) => {
      const segments = [];
      let currentIndex = 0;

      const patterns = {
        heading: /^(?<hashes>#+)\s*(?<headingText>[^\n]*)(?<newline>\n?)/m,
        verseNumber: /^(?<verseNumber>\d+\.\s*)/,
        newline: /^(?<newline>\n)/,
        word: /^(?<word>[a-zA-Z]+(?:['’-][a-zA-Z]+)*\s*)/,
        punctuation: /^(?<punctuation>[^\w\n]+)/,
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
          currentIndex += verseNumberMatch[0].length;
          continue;
        }

        // Newline
        const newlineMatch = substring.match(patterns.newline);
        if (newlineMatch) {
          const { newline } = newlineMatch.groups;
          segments.push({ type: "newline", text: newline });
          currentIndex += newlineMatch[0].length;
          continue;
        }

        // Word
        const wordMatch = substring.match(patterns.word);
        if (wordMatch) {
          const { word } = wordMatch.groups;
          segments.push({ type: "word", text: word });
          currentIndex += wordMatch[0].length;
          continue;
        }

        // Punctuation
        const punctuationMatch = substring.match(patterns.punctuation);
        if (punctuationMatch) {
          const { punctuation } = punctuationMatch.groups;
          segments.push({ type: "punctuation", text: punctuation });
          currentIndex += punctuationMatch[0].length;
          continue;
        }

        // Unknown character
        segments.push({ type: "unknown", text: substring[0] });
        currentIndex += 1;
      }

      return segments;
    };

    const processedSegments = tokenizePassage(passage.text);
    setSegments(processedSegments);

    // All segments are initially hidden
    const initialRevealedSegments = processedSegments.map(() => "");
    setRevealedSegments(initialRevealedSegments);
    setCurrentSegmentIndex(0);
    setIncorrectGuesses(0);
    setEarnedPoints(0);
    setMissedPoints(0);

    // Update refs
    currentSegmentIndexRef.current = 0;
    incorrectGuessesRef.current = 0;
    segmentsRef.current = processedSegments;
    revealedSegmentsRef.current = initialRevealedSegments;
    earnedPointsRef.current = 0;
    missedPointsRef.current = 0;

    // Calculate total points
    const totalWords = processedSegments.filter(
      (segment) => segment.type === "word" || segment.type === "unknown"
    ).length;
    setTotalPoints(totalWords * 3);
  }, [passage]);

  useEffect(() => {
    // Reveal non-guessable segments starting from currentSegmentIndex
    if (segments.length === 0) return;

    let index = currentSegmentIndex;
    let updatedRevealedSegments = [...revealedSegments];
    let indexChanged = false;

    while (
      index < segments.length &&
      segments[index].type !== "word" &&
      segments[index].type !== "unknown"
    ) {
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

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [revealedSegments]);

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

        if (segment.type === "word" || segment.type === "unknown") {
          const expectedChar = segment.text.trim()[0].toLowerCase();

          if (inputChar === expectedChar) {
            // Correct guess; reveal the segment
            setRevealedSegments((prev) => {
              const updated = [...prev];
              updated[index] = segment.text;
              revealedSegmentsRef.current = updated;
              return updated;
            });

            // Scoring
            const misses = incorrectGuessesRef.current;
            const pointsEarned = 3 - misses;

            setEarnedPoints((prev) => prev + pointsEarned);
            earnedPointsRef.current += pointsEarned;

            // Reset incorrect guesses
            setIncorrectGuesses(0);
            incorrectGuessesRef.current = 0;

            currentSegmentIndexRef.current = index + 1;
            setCurrentSegmentIndex(index + 1);
          } else {
            // Incorrect guess handling
            setIncorrectGuesses((prev) => prev + 1);
            incorrectGuessesRef.current += 1;

            // Increment missedPoints by 1
            setMissedPoints((prev) => prev + 1);
            missedPointsRef.current += 1;

            flashScreen("red");

            if (incorrectGuessesRef.current >= 3) {
              // Reveal the segment highlighted in red
              setRevealedSegments((prev) => {
                const updated = [...prev];
                updated[
                  index
                ] = `<span style="color: red;">${segment.text}</span>`;
                revealedSegmentsRef.current = updated;
                return updated;
              });

              // No points earned for this word (earnedPoints remains the same)

              // Reset incorrect guesses
              setIncorrectGuesses(0);
              incorrectGuessesRef.current = 0;
              currentSegmentIndexRef.current = index + 1;
              setCurrentSegmentIndex(index + 1);
            }
          }
          e.preventDefault();
        } else {
          // Skip non-word segments
          currentSegmentIndexRef.current = index + 1;
          setCurrentSegmentIndex(index + 1);
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
          if (segment.type === "word" || segment.type === "unknown") {
            updatedRevealedSegments[
              index
            ] = `<span style="color: gray;">${segment.text}</span>`;
          } else if (segment.type === "heading") {
            updatedRevealedSegments[
              index
            ] = `<h${segment.level} class="heading">${segment.text}</h${segment.level}>`;
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

  useEffect(() => {
    // Focus the input on mount and whenever segments are updated to ensure keyboard visibility
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [segments]);

  const progressPercentage =
    totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  const missedPercentage =
    totalPoints > 0 ? (missedPoints / totalPoints) * 100 : 0;

  return (
    <div
      style={{
        backgroundColor: flashColor || "transparent",
        transition: "background-color 0.2s",
      }}
    >
      <h2>Memorization Practice</h2>
      <input
        ref={inputRef}
        style={{ position: "absolute", opacity: 0, height: 0, width: 0 }}
        aria-hidden="true"
      />
      <div
        className="passage-display"
        dangerouslySetInnerHTML={{ __html: revealedSegments.join("") }}
      ></div>
      <ProgressBar progress={progressPercentage} missed={missedPercentage} />
      <button onClick={exitPractice}>Exit Practice</button>
      <div ref={bottomRef} />
    </div>
  );
}

export default MemorizationPractice;
