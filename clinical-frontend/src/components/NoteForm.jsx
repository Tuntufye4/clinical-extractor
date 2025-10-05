import React, { useState } from "react";

export default function NoteForm({ onSubmit, loading }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return alert("Please enter a note first.");
    onSubmit(text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl shadow-md">
      <label className="block mb-2 font-semibold text-gray-700">
        Enter Clinical Note:
      </label>
      <textarea    
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or paste clinical note here..."
        className="w-full h-32 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
      ></textarea>
      <button
        type="submit"
        disabled={loading}
        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
      >
        {loading ? "Extracting..." : "Extract Entities"}
      </button>
    </form>
  );
}
