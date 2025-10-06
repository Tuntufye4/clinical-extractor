import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import NoteForm from "./components/NoteForm";
import EntityTable from "./components/EntityTable";

export default function App() {
  const [activeSection, setActiveSection] = useState("noteForm");
  const [entities, setEntities] = useState([]);
  const [notes, setNotes] = useState([]);
  const [extractionResult, setExtractionResult] = useState(null);  

  // Fetch entities
  const fetchEntities = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/extract/");
      if (!response.ok) {
        console.error("Failed to fetch entities:", response.status);
        return;
      }
      const data = await response.json();
      setEntities(data);
    } catch (error) {
      console.error("Error fetching entities:", error);
    }
  };

  // Fetch unextracted notes
  const fetchNotes = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/extract/");
      if (!response.ok) {
        console.error("Failed to fetch notes:", response.status);
        return;
      }
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchEntities();
    fetchNotes();
  }, []);

  const handleExtraction = async (noteText) => {
    try {
      const response = await fetch("http://localhost:8000/api/extract/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: noteText }),
      });
        
      if (!response.ok) {
        console.error("Extraction failed:", response.status);
        return;
      }

      const result = await response.json();
      console.log("Extraction result:", result);
      setExtractionResult(result);
      fetchEntities();
      fetchNotes();
      setActiveSection("entities");
    } catch (error) {
      console.error("Error during extraction:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Main content area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeSection === "noteForm" && (
          <NoteForm onExtract={handleExtraction} />
        )}

        {activeSection === "notes" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Unextracted Notes</h2>
            {notes.length === 0 ? (
              <p>No notes found. Try adding one.</p>
            ) : (
              <ul className="space-y-3">
                {notes.map((note) => (
                  <li
                    key={note.id}
                    className="p-4 bg-white rounded-lg shadow border"
                  >
                    {note.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {activeSection === "entities" && (
          <EntityTable entities={entities} />
        )}
      </div>
    </div>
  );
}
