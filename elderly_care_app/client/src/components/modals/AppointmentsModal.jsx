import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { checkPermissions } from "../../utils/permissions";
import "../../styles/Appointments.css";

const AppointmentsModal = ({
  date,
  appointments,
  setAppointments,
  onClose,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    time: "",
    assignedTo: "",
  });

  const modalRef = useRef();
  
  // Get permissions
  const { canAdd, canEdit, canDelete, canView } = checkPermissions();

  useEffect(() => {
    // Fetch users when component mounts
    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/contactusers', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`,
          },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Handler for clicks outside the modal
    const handleOutsideClick = (e) => {
      // If the click target is outside the modal element, trigger onClose
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    // Handler for pressing the Escape key
    const handleEscape = (e) => {
      // If Escape key is pressed, trigger onClose
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Add event listeners when the component mounts
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    // Cleanup event listeners when the component unmounts or when onClose changes
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      time: "",
      assignedTo: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleAddAppointment = () => {
    if (!canAdd) return;
    const newAppointment = {
      id: Date.now(),
      ...formData,
      date,
    };
    setAppointments((prev) => [...prev, newAppointment]);
    resetForm();
  };

  const handleEdit = (appointment) => {
    if (!canEdit) return;
    setEditingId(appointment.id);
    setFormData({ ...appointment });
    setShowForm(true);
  };

  const handleSaveEdit = () => {
    if (!canEdit) return;
    const updated = appointments.map((app) =>
      app.id === editingId ? { ...formData, id: editingId, date } : app
    );
    setAppointments(updated);
    resetForm();
  };

  const handleDelete = (id) => {
    if (!canDelete) return;
    const updated = appointments.filter((app) => app.id !== id);
    setAppointments(updated);
  };

  const appointmentsForDate = appointments.filter((app) => app.date === date);

  if (!canView) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <p className="text-center text-[var(--text)]">
            You don't have permission to view appointments.
          </p>
          <div className="flex justify-center mt-4">
            <button className="nav-button" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div ref={modalRef} className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            Appointments on {date}
          </h2>
          {!showForm && canAdd && (
            <button className="add-button" onClick={() => setShowForm(true)}>
              + Add
            </button>
          )}
        </div>

        {showForm ? (
          <form className="appointment-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Title"
              className="form-input"
              autoFocus
            />
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              className="form-input"
            />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Location"
              className="form-input"
            />
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="form-input"
            />
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.fullname} ({user.role})
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                className="add-button flex-1"
                onClick={editingId ? handleSaveEdit : handleAddAppointment}
              >
                {editingId ? "Save Changes" : "Add Appointment"}
              </button>
              <button
                className="nav-button flex-1"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="appointments-list-modal">
            {appointmentsForDate.length === 0 ? (
              <p className="text-center text-gray-500">No appointments scheduled.</p>
            ) : (
              appointmentsForDate.map((appointment) => (
                <div key={appointment.id} className="appointment-card">
                  <div className="appointment-info">
                    <h3 className="font-semibold">{appointment.title}</h3>
                    <p className="text-sm">{appointment.description}</p>
                    <p className="text-sm">
                      {appointment.time} at {appointment.location}
                    </p>
                  </div>
                  <div className="appointment-actions">
                    {canEdit && (
                      <button
                        className="edit-button"
                        onClick={() => handleEdit(appointment)}
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(appointment.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsModal;