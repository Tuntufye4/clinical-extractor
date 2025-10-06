import { useEffect, useState } from "react";
import axios from "axios";

export default function EntityTable() {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch extracted entities from backend
  useEffect(() => {
    async function fetchEntities() {
      try {
        const res = await axios.get("http://localhost:8000/api/extract/");
        const extracted = [];

        // Flatten nested data (notes + entities)
        res.data.forEach((item) => {
          item.entities.forEach((ent) => {
            extracted.push({
              id: ent.id,
              note: item.note.text,
              person: ent.person || "-",
              age: ent.age || "-",
              drug: ent.drug || "-",
              strength: ent.strength || "-",
              frequency: ent.frequency || "-",
              route: ent.route || "-",
              duration: ent.duration || "-",
              form: ent.form || "-",
              dosage: ent.dosage || "-",
              diagnosis: ent.diagnosis || "-",
              condition: ent.condition || "-",
              created_at: item.note.created_at,
            });
          });
        });

        setEntities(extracted);
      } catch (err) {
        console.error("Error fetching entities:", err);
        setError("Failed to load extracted entities. Check your backend connection.");
      } finally {
        setLoading(false);
      }
    }

    fetchEntities();
  }, []);   

  if (error)
    return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Extracted Entities</h2>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm text-sm">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th className="p-3 text-left">Person</th>
            <th className="p-3 text-left">Age</th>
            <th className="p-3 text-left">Drug</th>
            <th className="p-3 text-left">Strength</th>
            <th className="p-3 text-left">Frequency</th>
            <th className="p-3 text-left">Duration</th>
            <th className="p-3 text-left">Form</th>
            <th className="p-3 text-left">Diagnosis</th>
            <th className="p-3 text-left">Condition</th>
            <th className="p-3 text-left">Note Text</th>
            <th className="p-3 text-left">Created At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entities.map((ent) => (
            <tr key={ent.id} className="hover:bg-gray-50 transition">
              <td className="p-3">{ent.person}</td>
              <td className="p-3">{ent.age}</td>
              <td className="p-3">{ent.drug}</td>
              <td className="p-3">{ent.strength}</td>
              <td className="p-3">{ent.frequency}</td>
              <td className="p-3">{ent.duration}</td>
              <td className="p-3">{ent.form}</td>
              <td className="p-3">{ent.diagnosis}</td>
              <td className="p-3">{ent.condition}</td>
              <td className="p-3 max-w-[250px] truncate">{ent.note}</td>
              <td className="p-3 text-gray-400">
                {new Date(ent.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
