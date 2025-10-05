import { useEffect, useState } from "react";
import axios from "axios";

export default function EntityTable() {   
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchEntities() {
      try {
        const res = await axios.get("http://localhost:8000/api/extract/");
        if (res.data.message === "No entities found. Try posting a note first.") {
          setError(res.data.message);
          setEntities([]);
        } else {
          setEntities(res.data);
        }
      } catch (err) {
        setError("Failed to load entities. Please check the API.");
      } finally {
        setLoading(false);
      }
    }
    fetchEntities();
  }, []);

  if (loading)
    return (
      <div className="text-center text-gray-500 mt-10">Loading entities...</div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 mt-10 font-medium">
        {error}
      </div>
    );

  if (entities.length === 0)
    return (
      <div className="text-center text-gray-500 mt-10">
        No entities found. Try posting a note first.
      </div>
    );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Extracted Entities
      </h2>
      {entities.map((entry, index) => (
        <div
          key={index}
          className="bg-white shadow-md rounded-2xl p-5 mb-6 border border-gray-200"
        >
          <h3 className="text-lg font-medium mb-2 text-gray-700">
            Clinical Note #{entry.note.id}
          </h3>
          <p className="text-gray-600 mb-4">{entry.note.text}</p>

          {entry.entities.length > 0 ? (
            <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 border-b text-left text-gray-700 font-medium">
                    Entity Type
                  </th>
                  <th className="py-2 px-3 border-b text-left text-gray-700 font-medium">
                    Values
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(entry.entities[0])
                  .filter(([key]) => !["id", "note"].includes(key))
                  .map(([key, value]) => (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="py-2 px-3 border-b capitalize text-gray-800">
                        {key}
                      </td>
                      <td className="py-2 px-3 border-b text-gray-600">
                        {value || "-"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 italic">No entities extracted.</p>
          )}
        </div>
      ))}   
    </div>
  );
}
               