import { useEffect, useState } from "react";
import axios from "axios";

export default function EntityTable() {
  const [entities, setEntities] = useState([]);
  const [filteredEntities, setFilteredEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

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
        setFilteredEntities(extracted);
      } catch (err) {
        console.error("Error fetching entities:", err);
        setError("Failed to load extracted entities. Check your backend connection.");
      } finally {
        setLoading(false);
      }
    }

    fetchEntities();
  }, []);

  // Filter entities by search input
  useEffect(() => {
    const filtered = entities.filter((ent) =>
      Object.values(ent)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    setFilteredEntities(filtered);
    setCurrentPage(1);
  }, [search, entities]);

  // Pagination logic
  const totalPages = Math.ceil(filteredEntities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEntities = filteredEntities.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-md">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3 sm:mb-0">
          Extracted Entities
        </h2>
        <input
          type="text"
          placeholder="Search entities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-full px-4 py-2 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="min-w-full text-sm bg-white rounded-2xl overflow-hidden">
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
              <th className="p-3 text-left">Created At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentEntities.map((ent) => (
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

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredEntities.length)} of {filteredEntities.length}
        </p>
        <div className="flex items-center space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-gray-700 font-medium">
            Page {currentPage} of {totalPages || 1}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
