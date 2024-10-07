// BiblePassageImporter.js
import React, { useState, useEffect } from "react";

function BiblePassageImporter({ addPassage, closeImporter }) {
  const [apiKey, setApiKey] = useState("");
  const [bibles, setBibles] = useState([]);
  const [selectedBible, setSelectedBible] = useState("");
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState("");
  const [passageText, setPassageText] = useState("");
  const [error, setError] = useState("");

  const baseUrl = "https://api.scripture.api.bible/v1/";

  // Function to call the API
  const callAPI = async (serviceUrl) => {
    try {
      const response = await fetch(baseUrl + serviceUrl, {
        headers: {
          "api-key": apiKey,
          accept: "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API Error: ${response.statusText} - ${errorData.error}`
        );
      }
      return await response.json();
    } catch (err) {
      setError(err.message);
      console.error(err);
      return null;
    }
  };

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem("apiKey");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  // Save API key to localStorage when it changes
  useEffect(() => {
    if (apiKey.trim() !== "") {
      localStorage.setItem("apiKey", apiKey);
    }
  }, [apiKey]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("apiKey");
    setApiKey("");
    setBibles([]);
    setSelectedBible("");
    setBooks([]);
    setSelectedBook("");
    setChapters([]);
    setSelectedChapter("");
    setPassageText("");
    setError("");
  };

  // Fetch Bibles when API key is provided
  useEffect(() => {
    if (apiKey.trim() === "") {
      return;
    }
    const fetchBibles = async () => {
      const data = await callAPI("bibles?language=eng");
      if (data && data.data) {
        setBibles(data.data);
      }
    };
    fetchBibles();
  }, [apiKey]);

  // Fetch Books when a Bible is selected
  useEffect(() => {
    if (selectedBible === "") return;
    const fetchBooks = async () => {
      const data = await callAPI(`bibles/${selectedBible}/books`);
      if (data && data.data) {
        setBooks(data.data);
      }
    };
    fetchBooks();
  }, [selectedBible]);

  // Fetch Chapters when a Book is selected
  useEffect(() => {
    if (selectedBible === "" || selectedBook === "") return;
    const fetchChapters = async () => {
      const data = await callAPI(
        `bibles/${selectedBible}/books/${selectedBook}/chapters`
      );
      if (data && data.data) {
        setChapters(data.data);
      }
    };
    fetchChapters();
  }, [selectedBible, selectedBook]);

  // Parse items recursively to convert to Markdown
  const parseItem = (item) => {
    let content = "";

    // Check for section/title
    if (item.name === "para" && item.attrs?.style === "s1") {
      content += "\n## " + (item.items?.[0]?.text || "") + "\n";
    }
    // Verse number
    else if (item.name === "verse") {
      content += "\n" + (item.attrs?.number || "") + ". ";
    } else if (item.attrs?.style === "r") {
      // Do nothing for references
    } else if (item.text) {
      content += item.text.trim() + " ";
      if (item.items) {
        for (const subItem of item.items) {
          content += parseItem(subItem);
        }
      }
    } else {
      // Recurse into child items
      if (item.items) {
        for (const subItem of item.items) {
          content += parseItem(subItem);
        }
      }
    }
    return content;
  };

  // Reformat the passage content into Markdown
  const reformatToMarkdown = (passage) => {
    let content = "# " + passage.reference + "\n";

    for (const item of passage.content) {
      content += parseItem(item);
    }
    return content.trim();
  };

  // Load Passage when a Chapter is selected
  useEffect(() => {
    if (selectedBible === "" || selectedChapter === "") return;
    const fetchPassage = async () => {
      const serviceUrl = `bibles/${selectedBible}/passages/${selectedChapter}?content-type=json&include-verse-numbers=true&include-titles=true`;
      const data = await callAPI(serviceUrl);
      if (data && data.data) {
        // Process data.data to extract text
        const content = reformatToMarkdown(data.data);
        setPassageText(content);
      } else {
        setPassageText("");
      }
    };
    fetchPassage();
  }, [selectedBible, selectedChapter]);

  const handleImportPassage = () => {
    if (passageText.trim() === "") {
      alert("No passage text to import.");
      return;
    }
    const chapterInfo = chapters.find((ch) => ch.id === selectedChapter);
    const passageName = chapterInfo
      ? chapterInfo.reference
      : `${selectedBook} ${selectedChapter}`;
    addPassage({
      name: passageName,
      text: passageText.trim(),
    });
    // Reset selections
    setSelectedBible("");
    setSelectedBook("");
    setSelectedChapter("");
    setBooks([]);
    setChapters([]);
    setPassageText("");
    alert("Passage imported successfully!");
  };

  return (
    <div>
      <h2>Import Passage from Bible API</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {apiKey.trim() === "" ? (
        // Show API key input for authentication
        <div>
          <label>
            API Key:
            <input
              type="text"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value.trim());
                // Clear any previous data
                setBibles([]);
                setSelectedBible("");
                setBooks([]);
                setSelectedBook("");
                setChapters([]);
                setSelectedChapter("");
                setPassageText("");
                setError("");
              }}
              placeholder="Enter your API key"
              style={{ width: "100%" }}
            />
          </label>
        </div>
      ) : (
        // Show the passage importer UI
        <>
          <p>
            Logged in with API Key: ****{apiKey.slice(-4)}
            <button onClick={handleLogout} style={{ marginLeft: "10px" }}>
              Log Out
            </button>
          </p>
          <div>
            <label>
              Select Bible Translation:
              <select
                value={selectedBible}
                onChange={(e) => {
                  setSelectedBible(e.target.value);
                  setBooks([]);
                  setSelectedBook("");
                  setChapters([]);
                  setSelectedChapter("");
                  setPassageText("");
                }}
                style={{ width: "100%" }}
              >
                <option value="">-- Select Bible --</option>
                {bibles.map((bible) => (
                  <option key={bible.id} value={bible.id}>
                    {bible.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {selectedBible !== "" && (
            <div>
              <label>
                Select Book:
                <select
                  value={selectedBook}
                  onChange={(e) => {
                    setSelectedBook(e.target.value);
                    setChapters([]);
                    setSelectedChapter("");
                    setPassageText("");
                  }}
                  style={{ width: "100%" }}
                >
                  <option value="">-- Select Book --</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {selectedBook !== "" && (
            <div>
              <label>
                Select Chapter:
                <select
                  value={selectedChapter}
                  onChange={(e) => {
                    setSelectedChapter(e.target.value);
                    setPassageText("");
                  }}
                  style={{ width: "100%" }}
                >
                  <option value="">-- Select Chapter --</option>
                  {chapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.reference}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {passageText && (
            <div>
              <h3>Preview:</h3>
              <textarea
                value={passageText}
                readOnly
                rows={10}
                style={{ width: "100%" }}
              ></textarea>
              <button onClick={handleImportPassage}>Import Passage</button>
            </div>
          )}
        </>
      )}
      <button onClick={closeImporter} style={{ marginTop: "10px" }}>
        Close
      </button>
    </div>
  );
}

export default BiblePassageImporter;
