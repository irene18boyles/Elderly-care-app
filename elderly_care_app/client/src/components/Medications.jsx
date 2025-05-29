import { useEffect, useState } from "react";
import AddMedicationModal from '../components/modals/AddMedicationModal';
import '../styles/Medication.css';
import { checkPermissions } from '../utils/permissions';

export default function MedicationPage() {
  const [meds, setMeds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { canAdd, canEdit } = checkPermissions();

  const fetchMedications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      if (!token) throw new Error('User not logged in');

      const res = await fetch('https://elderly-care-app.onrender.com/api/medications', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch medications');

      const data = await res.json();
      setMeds(data);
    } catch (error) {
      console.error(error);
      setMeds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const handleAddMedication = async () => {
    await fetchMedications(); // Refresh the entire list after adding
    setShowModal(false);
  };

  const toggleTaken = async (medId) => {
    if (!canEdit) {
      alert('You do not have permission to mark medications as taken.');
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        alert('User not logged in');
        return;
      }

      const medToToggle = meds.find(med => med._id === medId);
      if (!medToToggle) return;

      const updatedTaken = !medToToggle.taken;

      // Update the UI immediately for better user experience
      setMeds(prevMeds =>
        prevMeds.map(med =>
          med._id === medId ? { ...med, taken: updatedTaken } : med
        )
      );

      const res = await fetch(`https://elderly-care-app.onrender.com/api/toggle/${medId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ taken: updatedTaken }),
      });

      if (!res.ok) {
        // Revert the UI change if the API call fails
        setMeds(prevMeds =>
          prevMeds.map(med =>
            med._id === medId ? { ...med, taken: !updatedTaken } : med
          )
        );
        throw new Error('Failed to update medication');
      }

      // Refresh the list after successful toggle
      await fetchMedications();

    } catch (error) {
      console.error(error);
      alert('Error updating medication status');
    }
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const grouped = meds.reduce((acc, med) => {
    if (!acc[med.day]) acc[med.day] = [];
    acc[med.day].push(med);
    return acc;
  }, {});

  return (
    <div className="page-wrapper">
      <div className="container">
        <h2 className="heading">Medications</h2>
        {canAdd && (
          <button
            className="add-button"
            onClick={() => setShowModal(true)}
            aria-label="Add Medication"
          >
            + Add
          </button>
        )}

        {loading ? (
          <p className="loading-text">Loading medications...</p>
        ) : meds.length === 0 ? (
          <p className="empty-text">No medications found.</p>
        ) : (
          <div className="custom-scrollbar medications-list">
            {weekDays.map(day => (
              <div key={day}>
                <h3 className="day-heading">{day}</h3>
                {grouped[day] && grouped[day].length > 0 ? (
                  grouped[day]
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((med) => (
                      <div
                        key={med._id}
                        className="med-item"
                      >
                        <span
                          className={med.taken ? "med-name-taken" : "med-name"}
                        >
                          {med.medicine}
                        </span>
                        <span className="med-time">
                          {med.time}
                        </span>
                        {canEdit && (
                          <input
                            type="checkbox"
                            checked={med.taken || false}
                            onChange={() => toggleTaken(med._id)}
                            className="checkbox"
                            aria-label={`Mark ${med.medicine} as taken`}
                          />
                        )}
                      </div>
                    ))
                ) : (
                  <div className="no-med">
                    No medication
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <AddMedicationModal
            onClose={() => setShowModal(false)}
            onAdd={handleAddMedication}
          />
        )}
      </div>
    </div>
  );
}
