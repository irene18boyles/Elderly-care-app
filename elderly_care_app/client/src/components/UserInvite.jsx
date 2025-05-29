import { useState } from 'react';
import axios from 'axios';
import '../styles/UserInvite.css';

const UserInvite = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState({ fullname: '', email: '', role: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('userToken');
      const res = await axios.post(
        'http://localhost:8000/api/contactusers/user-invite',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(res.data.message);
      setFormData({ fullname: '', email: '', role: '' });
      
      // Call onUserAdded to refresh the user list
      if (onUserAdded) {
        onUserAdded();
      }
      
      // Close the modal after a delay
      setTimeout(onClose, 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error sending invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2 className="title">Add User</h2>
        <form onSubmit={handleSubmit} className="form">
          <input
            name="fullname"
            placeholder="Full Name"
            value={formData.fullname}
            onChange={handleChange}
            required
            className="input"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input"
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="select"
          >
            <option value="" disabled>Select Role</option>
            <option value="family">Family</option>
            <option value="caregiver">Caregiver</option>
          </select>
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Sending...' : 'Add User'}
          </button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default UserInvite;
