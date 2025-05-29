import { useEffect, useState } from "react";
import axios from "axios";

export default function PatientsDetails() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    patientFullName: "",
    age: "",
    gender: "",
    dateOfBirth: "",
    bloodtype: "",
    weight: "",
    height: "",
    allergies: "",
    medicalConditions: "",
    medications: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phoneNumber: "",
    },
  });

  const API_PATIENT_URL =
    import.meta.env.VITE_PATIENT_URL || "http://localhost:8000/api/patient/getdetails";

  const API_PATIENT_DETAILS_UPDATE_URL =
    import.meta.env.VITE_PATIENT_DETAILS_UPDATE_URL || "http://localhost:8000/api/patient/updatedetails";

  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("userToken");
        if (!token) throw new Error("No token found, please login.");

        const res = await axios.get(API_PATIENT_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data.data;

        setProfile(data);

        // Set formData based on API response, safely checking properties
        setFormData({
          patientFullName: data.patientFullName || "",
          age: data.age ?? "",
          gender: data.gender || "",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : "",
          bloodtype: data.bloodtype || "",
          weight: data.weight || "",
          height: data.height || "",
          allergies: data.allergies || "",
          medicalConditions: data.medicalConditions || "",
          medications: data.medications || "",
          emergencyContact:{
            name: data.emergencyContact?.name ?? "",
            relationship: data.emergencyContact?.relationship ?? "",
            phoneNumber: data.emergencyContact?.phoneNumber ?? "",
          },
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, []);

  // Handles both normal and nested fields for emergencyContact
  const handleChange = (e) => {
    const { name, value } = e.target;

  if (name.includes('.')) {
    const [parent, child] = name.split('.');
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: value,
      },
    }));
  } else {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log("Fetching patients profile...");


    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("No token found, please login.");
        console.log("Form data being sent:", formData);

      const res = await axios.put(API_PATIENT_DETAILS_UPDATE_URL, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfile(res.data.data || res.data);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!profile) return <p>No profile data found.</p>;

  return (
    <div className="max-w-xl mx-auto p-6 mt-10 bg-white rounded-2xl shadow-lg border">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">PATIENT'S DETAILS</h2>

      {!editing ? (
        <div className="space-y-4 text-gray-700">
          <div><span className="font-semibold">Full Name:</span> {profile.patientFullName || "N/A"}</div>
          <div><span className="font-semibold">Age:</span> {profile.age || "N/A"}</div>
          <div><span className="font-semibold">Gender:</span> {profile.gender || "N/A"}</div>
          <div><span className="font-semibold">Date of Birth:</span> {profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "N/A"}</div>
          <div><span className="font-semibold">Blood Type:</span> {profile.bloodtype || "N/A"}</div>
          <div><span className="font-semibold">Weight (kg):</span> {profile.weight ?? "N/A"}</div>
          <div><span className="font-semibold">Height (cm):</span> {profile.height ?? "N/A"}</div>
          <div><span className="font-semibold">Allergies:</span> {profile.allergies || "N/A"}</div>
          <div><span className="font-semibold">Medical Conditions:</span> {profile.medicalConditions || "N/A"}</div>
          <div><span className="font-semibold">Medications:</span> {profile.medications || "N/A"}</div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Emergency Contact</h3>
            <div><span className="font-semibold">Name:</span> {profile.emergencyContact?.name || "N/A"}</div>
            <div><span className="font-semibold">Relationship:</span> {profile.emergencyContact?.relationship || "N/A"}</div>
            <div><span className="font-semibold">Phone Number:</span> {profile.emergencyContact?.phoneNumber || "N/A"}</div>
          </div>

          <button
            onClick={() => setEditing(true)}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            ["Full Name", "patientFullName", "text"],
            ["Age", "age", "text"],
            ["Gender", "gender", "select", ["", "Female", "Male", "Other"]],
            ["Date of Birth", "dateOfBirth", "date"],
            ["Blood Type", "bloodtype", "select", ["", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]],
            ["Weight (kg)", "weight", "number"],
            ["Height (cm)", "height", "number"],
            ["Allergies", "allergies", "text"],
            ["Medical Conditions", "medicalConditions", "text"],
            ["Medications", "medications", "text"],
          ].map(([label, name, type, options]) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700">{label}</label>
              {type === "select" ? (
                <select
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                >
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt === "" ? `Select ${label}` : opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                />
              )}
            </div>
          ))}

          <fieldset className="border p-4 rounded">
            <legend className="font-semibold mb-2">Emergency Contact</legend>
            {["name", "relationship", "phoneNumber"].map((field) => (
              <div key={field} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 capitalize">{field}</label>
                <input
                  type="text"
                  name={`emergencyContact.${field}`}
                  value={formData.emergencyContact[field]}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                />
              </div>
            ))}
          </fieldset>

          <div className="flex justify-between mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
