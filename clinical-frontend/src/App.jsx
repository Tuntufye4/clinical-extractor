import { useState, useEffect } from "react";
import EntityTable from "./components/EntityTable";

export default function App() {  
  const [note, setNote] = useState("");
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch entities from backend
  const fetchEntities = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/extract/");   
      const data = await response.json();      
      setEntities(data);         
    } catch (error) {
      console.error("Error fetching entities:", error);   
    }
  };
      
  // Submit note to backend for extraction
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.trim()) return alert("Please enter a clinical note.");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/extract/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: note }),
      });

      const data = await response.json();
      console.log("Extraction result:", data);

      setNote("");
      await fetchEntities(); // Refresh after extraction
    } catch (error) {
      console.error("Error submitting note:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center py-10 px-4">
      <h1 className="text-4xl font-bold mb-6 text-center text-black">
          Clinical Entity Extractor
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-gray-50 shadow-md rounded-xl p-6 border border-gray-200 mb-10"
      >
        <label htmlFor="note" className="block text-lg font-semibold mb-3">
          Enter Clinical Note
        </label>
        <textarea
          id="note"
          rows="6"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Type or paste a clinical note here..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4"
        ></textarea>
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2 rounded-lg text-white font-semibold ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 transition"
          }`}
        >
          {loading ? "Extracting..." : "Extract Entities"}
        </button>
      </form>

      <div className="w-full max-w-5xl">
        <EntityTable entities={entities} />
      </div>
    </div>
  );
}
     