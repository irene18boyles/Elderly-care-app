import { useState, useEffect } from "react";
import axios from "axios";
import { checkPermissions } from "../utils/permissions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import SymptomModal from "./modals/SymptomModal";
import ReactMarkdown from "react-markdown";
import "../styles/SymptomsTracker.css";
import "../styles/Global.css";

export default function SymptomTracker() {
  const [symptoms, setSymptoms] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSymptomName, setSelectedSymptomName] = useState("");

  // AI suggestion states
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);

  // Get permissions
  const { canAdd, canDelete, canView } = checkPermissions();

  useEffect(() => {
    fetchSymptoms();
  }, []);

  async function fetchSymptoms() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.get("http://localhost:8000/api/symptoms", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSymptoms(res.data);
    } catch (error) {
      console.error("Error fetching symptoms:", error);
      setError("Failed to fetch symptoms");
    } finally {
      setLoading(false);
    }
  }

  async function addSymptom() {
    if (!canAdd) {
      setError("You don't have permission to add symptoms");
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError("Please fill in both Title and Description");
      return;
    }
    setError("");
    try {
      const token = localStorage.getItem("userToken");
      await axios.post(
        "http://localhost:8000/api/symptoms",
        { name: title.trim(), description: description.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setDescription("");
      fetchSymptoms();
    } catch (error) {
      console.error("Error adding symptom:", error);
      setError("Failed to add symptom");
    }
  }

  // Fetch AI suggestion based on symptoms
  async function getAiSuggestion() {
    if (!canView) {
      setError("You don't have permission to get AI suggestions");
      return;
    }

    setLoadingSuggestion(true);
    setShowSuggestion(false);
    setAiSuggestion("");
    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.post(
        "http://localhost:8000/api/symptoms/ai-suggestion",
        {
          symptoms: symptoms.map((s) => s.name),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data?.suggestion) {
        setAiSuggestion(res.data.suggestion);
        setShowSuggestion(true);
      }
    } catch (err) {
      console.error("Error getting AI suggestion:", err);
      setError("Failed to get AI suggestion");
    } finally {
      setLoadingSuggestion(false);
    }
  }

  // Aggregate symptom counts by name for the chart
  const dataByType = symptoms.reduce((acc, symptom) => {
    const found = acc.find((item) => item.name === symptom.name);
    if (found) {
      found.count += 1;
    } else {
      acc.push({ name: symptom.name, count: 1 });
    }
    return acc;
  }, []);

  // Handle bar click to open modal
  function handleBarClick(data) {
    if (!canView) {
      setError("You don't have permission to view symptom details");
      return;
    }
    setSelectedSymptomName(data.name);
    setModalOpen(true);
  }

  // Delete symptom
  async function deleteSymptom(id) {
    if (!canDelete) {
      setError("You don't have permission to delete symptoms");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this symptom?"))
      return;

    try {
      const token = localStorage.getItem("userToken");
      await axios.delete(`http://localhost:8000/api/symptoms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSymptoms();
    } catch (error) {
      console.error("Failed to delete symptom:", error);
      setError("Failed to delete symptom");
    }
  }

  function exportToCSV() {
    if (!canView) {
      setError("You don't have permission to export data");
      return;
    }

    const escapeCsv = (str) => `"${str.replace(/"/g, '""')}"`;

    const csvRows = [
      ["Title", "Description", "Timestamp"],
      ...symptoms.map((s) => [
        escapeCsv(s.name),
        escapeCsv(s.description),
        `"${new Date(s.dateLogged).toLocaleString()}"`,
      ]),
    ];

    const csvContent = csvRows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "symptoms.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!canView) {
    return (
      <section className="symptom-input-container">
        <h2>Symptoms</h2>
        <p className="error-message">You don't have permission to view symptoms.</p>
      </section>
    );
  }

  return (
    <section className="symptom-input-container">
      <h2>Symptoms</h2>

      {canAdd && (
        <div className="input-group">
          <input
            placeholder="Title (e.g., Fatigue)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input"
          />

          <div className="description-button-group">
            <input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button onClick={addSymptom}>Add</button>
          </div>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Loading symptoms...</p>
      ) : (
        <>
          <section className="symptom-chart-container">
            <h3>Symptom Frequency</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dataByType}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#82ca9d"
                  name="Occurrences"
                  onClick={handleBarClick}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
            {canView && <button onClick={exportToCSV}>Export Data</button>}
          </section>

          {modalOpen && (
            <SymptomModal
              selectedSymptomName={selectedSymptomName}
              symptoms={symptoms}
              canDelete={canDelete}
              onClose={() => setModalOpen(false)}
              onDelete={deleteSymptom}
            />
          )}

          {/* AI Suggestion Button & Display */}
          <div className="ai-suggestion-container">
            <button
              onClick={getAiSuggestion}
              disabled={loadingSuggestion || !canView}
              className="ai-button"
            >
              {loadingSuggestion ? "Getting advice..." : "Get AI Suggestion"}
            </button>

            {showSuggestion && (
              <div className="ai-suggestion-box prose prose-sm">
                <h4 className="text-lg font-semibold mb-3 text-blue-600">💡 AI Health Suggestion</h4>
                <ReactMarkdown>{aiSuggestion}</ReactMarkdown>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
