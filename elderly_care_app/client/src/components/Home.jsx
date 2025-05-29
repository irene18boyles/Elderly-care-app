import axios from "axios";
import { useEffect, useContext, useState } from "react";
import { NotesContext } from "../context/NotesContext";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Home() {
  const navigate = useNavigate();
  const { state, dispatch, fetchAllNotes, fetchUserNotes, capitalizeSentence } =
    useContext(NotesContext);
  const { notes } = state;
  const [symptoms, setSymptoms] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    const retryInterval = 1000; // 1 second

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(fetchData, retryInterval);
            return;
          }
          throw new Error("No authentication token found");
        }

        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        await Promise.all([
          fetchAllNotes(),
          fetchSymptoms(),
          fetchMedications()
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    const fetchSymptoms = async () => {
      const token = localStorage.getItem("userToken");
      const res = await axios.get("https://elderly-care-app.onrender.com/api/symptoms", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const symptomCounts = res.data.reduce((acc, item) => {
        acc[item.name] = (acc[item.name] || 0) + 1;
        return acc;
      }, {});

      const chartData = Object.keys(symptomCounts).map((name) => ({
        name,
        count: symptomCounts[name],
      }));

      setSymptoms(chartData);
    };

    const fetchMedications = async () => {
      const token = localStorage.getItem("userToken");
      const res = await axios.get("https://elderly-care-app.onrender.com/api/medications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedications(res.data);
    };

    fetchData();
  }, [fetchAllNotes]);

  if (loading) {
    return <div className="text-center p-4">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center p-4">Error: {error}</div>;
  }

  const today = new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Medications Section */}
        <div 
          className="border-2 border-black rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => navigate('/medications')}
        >
          <h2 className="text-orange-400 text-lg font-bold mb-2">
            Meds of the day
          </h2>
          <ul className="space-y-1">
            {medications.length === 0 ? (
              <li>No medications found.</li>
            ) : (
              medications
                .filter((med) => med.day.toLowerCase() === today)
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((med) => (
                  <li key={med._id}>
                    {med.time} - {med.medicine} -{" "}
                    {new Date(med.date).toLocaleDateString('en-US', { weekday: 'long' })}
                  </li>
                ))
            )}
          </ul>
        </div>

        {/* Appointments Section */}
        <div 
          className="border-2 border-black rounded-xl p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => navigate('/appointments')}
        >
          <h2 className="text-orange-400 text-lg font-bold mb-2">
            Upcoming Appointment
          </h2>
          <ul className="space-y-1">
            <li className="flex justify-between">
              <span>Heart Checkup</span>
              <span>05/19/25</span>
            </li>
            <li className="flex justify-between">
              <span>Ear Checkup</span>
              <span>05/19/25</span>
            </li>
            <li className="flex justify-between">
              <span>Laboratory</span>
              <span>05/15/25</span>
            </li>
            <li className="flex justify-between">
              <span>Chest X-ray</span>
              <span>05/16/25</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Notes Section */}
      <div 
        className="border-2 flex flex-col border-black text-black rounded-xl p-4 mt-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => navigate('/notesfeed')}
      >
        <h2 className="flex justify-center font-semibold mb-2">Notes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto">
          {[...notes]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 6)
            .map((note) => (
              <div key={note._id} className="bg-green-200 p-2">
                <h3 className="capitalize font-semibold">
                  Title: {note.title}
                </h3>
                <p>{capitalizeSentence(note.description)}</p>
                <div>
                  {note.created_by && (
                    <small className="text-black capitalize">
                      By: {note.created_by.fullname}
                    </small>
                  )}
                </div>
                

                <small>{new Date(note.date).toLocaleString()}</small>
              </div>
            ))}
        </div>
      </div>

      {/* Symptoms Chart Section */}
      <div 
        className="border-2 border-black rounded-xl p-4 mt-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => navigate('/symptom-tracker')}
      >
        <h2 className="text-orange-400 text-lg font-bold mb-4">
          Symptoms Chart
        </h2>
        {symptoms.length === 0 ? (
          <p className="text-gray-500">No data to display.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={symptoms}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}
