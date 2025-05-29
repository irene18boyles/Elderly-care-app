import { useEffect, useState } from "react";
import axios from "axios";

export default function ProfileSettings() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    contactNumber: "",
    address: "",
    gender: "",
    dateOfBirth: "",
  });
  const [passwords, setPasswords] = useState({
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
});
const [passwordMessage, setPasswordMessage] = useState("");


const API_PROFILE_URL = import.meta.env.VITE_PROFILE_SETTINGS_URL || "http://localhost:8000/api/profilesettings/settings";
const API_PROFILE_UPDATE_URL = import.meta.env.VITE_PROFILE_UPDATE_URL || "http://localhost:8000/api/profilesettings/updatesettings";

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("userToken");
        if (!token) throw new Error("No token found, please login.");

        const res = await axios.get(API_PROFILE_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data.data
        setProfile(data); // sollution to appear in ui
        setFormData({
          contactNumber: data.contactNumber || "",
          address: data.address || "",
          gender: data.gender || "",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0,10) : "", // format YYYY-MM-DD for input
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

///////////////////
// Handles changes
//////////////////
  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    setError(null);
    console.log("Fetching profile...");


    try {
      const token = localStorage.getItem("userToken"); // gets the token
      if (!token) throw new Error("No token found, please login.");

      const res = await axios.put(API_PROFILE_UPDATE_URL, formData, {
        headers: { Authorization: `Bearer ${token}` }, 
      });

      setProfile(res.data.data); // 
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
  }};

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!profile) return <p>No profile data found.</p>;

  const handlePasswordChange = (e) => {
      setPasswords({ ...passwords, [e.target.name]: e.target.value });
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordMessage("")
 
        if (passwords.newPassword !== passwords.confirmNewPassword) {
    return setPasswordMessage("New passwords do not match.");
  }

  try {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("No token found, please login.");

    await axios.put(
      "http://localhost:8000/api/profilesettings/changepassword",
      {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setPasswordMessage("Password changed successfully!");
    setPasswords({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
  } catch (err) {
    setPasswordMessage(err.response?.data?.message || err.message);
  }
}

  return (
   <div className="max-w-xl mx-auto p-6 mt-10 bg-white rounded-2xl shadow-lg border">
  <h2 className="text-2xl font-bold mb-6 text-gray-800">Profile Settings</h2>

  {error && (
    <p className="mb-4 text-red-600 bg-red-100 p-2 rounded">{error}</p>
  )}

  {loading ? (
    <p className="text-gray-500">Loading profile...</p>
  ) : (
    <>
      {!editing ? (
        <div className="space-y-4 text-gray-700">
          <div>
            <span className="font-semibold">Contact Number:</span> {profile.contactNumber || "N/A"}
          </div>
          <div>
            <span className="font-semibold">Address:</span> {profile.address || "N/A"}
          </div>
          <div>
            <span className="font-semibold">Gender:</span> {profile.gender || "N/A"}
          </div>
          <div>
            <span className="font-semibold">Date of Birth:</span> {profile.dateOfBirth?.slice(0,10) || "N/A"}
          </div>
          <button
            onClick={() => setEditing(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Number
            </label>
            <input
              type="text"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>

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
    </>
  )}

  <div className="mt-10 border-t pt-6">
  <h3 className="text-xl font-semibold mb-4 text-gray-800">Change Password</h3>

  {passwordMessage && (
    <p className={`mb-4 text-sm ${passwordMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
      {passwordMessage}
    </p>
  )}

  <form onSubmit={handlePasswordSubmit} className="space-y-4">
    <div>
      <label className="block text-sm font-medium">Current Password</label>
      <input
        type="password"
        name="currentPassword"
        value={passwords.currentPassword}
        onChange={handlePasswordChange}
        className="w-full px-3 py-2 border border-gray-300 rounded"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium">New Password</label>
      <input
        type="password"
        name="newPassword"
        value={passwords.newPassword}
        onChange={handlePasswordChange}
        className="w-full px-3 py-2 border border-gray-300 rounded"
        required
      />
    </div>
    <div>
      <label className="block text-sm font-medium">Confirm New Password</label>
      <input
        type="password"
        name="confirmNewPassword"
        value={passwords.confirmNewPassword}
        onChange={handlePasswordChange}
        className="w-full px-3 py-2 border border-gray-300 rounded"
        required
      />
    </div>
    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
      Update Password
    </button>
  </form>
</div>

</div>


  );
}
