import { useState } from "react";
import "../../styles/AddMedicationModal.css";
import { checkPermissions } from '../../utils/permissions';

export default function AddMedicationModal({ onClose, onAdd }) {
  const [medicine, setMedicine] = useState('');
  const [time, setTime] = useState('');
  const [day, setDay] = useState('');
  const [date, setDate] = useState('');
  const { canAdd } = checkPermissions();

  const handleSubmit = async () => {
    if (!canAdd) {
      alert("You do not have permission to add medications.");
      return;
    }

    const token = localStorage.getItem('userToken');
    if (!token) {
      alert("Error: Missing user ID. Please log in again.");
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/medications', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ medicine, time, day, date })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        alert("Failed to add medication. See console for details.");
        return;
      }

      const data = await response.json();
      if (onAdd) {
        await onAdd(data.medication);
      }

    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Please try again.");
    }
  };

  if (!canAdd) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3 className="modal-title">Permission Denied</h3>
          <p className="text-center text-red-600 mb-4">You do not have permission to add medications.</p>
          <div className="modal-actions">
            <button className="modal-button-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Add Medication</h3>

        <input
          className="modal-input"
          placeholder="Medicine"
          value={medicine}
          onChange={e => setMedicine(e.target.value)}
          required
        />

        <input
          className="modal-input"
          placeholder="Time (e.g. 6:00 AM)"
          value={time}
          onChange={e => setTime(e.target.value)}
          required
        />

        <select
          className="modal-input"
          value={day}
          onChange={e => setDay(e.target.value)}
          required
        >
          <option value="">Select Day</option>
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
          <option value="Sunday">Sunday</option>
        </select>

        <input
          type="date"
          className="modal-input"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />

        <div className="modal-actions">
          <button 
            className="modal-button-primary" 
            onClick={handleSubmit}
            disabled={!medicine || !time || !day || !date}
          >
            Add
          </button>
          <button className="modal-button-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
