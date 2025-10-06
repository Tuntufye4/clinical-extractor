import { useState } from "react";
import axios from "axios";

export default function NoteForm() {
  const [text, setText] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/api/extract/", { text });
      setResponse(res.data);
      setText("");
    } catch {
      setResponse({ error: "Failed to extract entities." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>   
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          rows="5"
          placeholder="Enter clinical text..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Extracting..." : "Extract Entities"}
        </button>
      </form>

      {response && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          {response.error ? (
            <p className="text-red-500">{response.error}</p>
          ) : (
            <>
              <p className="text-gray-700 font-medium">✅ Extraction Successful</p>
            </>
          )}
        </div>   
      )}
    </div>
  );
}
    