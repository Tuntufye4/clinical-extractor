import { useEffect, useState } from "react";
import axios from "axios";

export default function UnextractedList() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const res = await axios.get("http://localhost:8000/api/extract/");
        setNotes(res.data);
      } catch {
        setNotes([]);   
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, []);

  if (loading)
    return <div className="text-gray-500 mt-10 text-center">Loading notes...</div>;

  if (notes.length === 0)
    return <div className="text-gray-500 mt-10 text-center">No unextracted notes found.</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Unextracted Notes</h2>
      {notes.map((note) => (
        <div key={note.id} className="p-4 mb-4 border border-gray-200 rounded-lg bg-white shadow-sm">
          <p className="text-gray-700">{note.text}</p>
          <p className="text-sm text-gray-400 mt-2">Created: {new Date(note.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
