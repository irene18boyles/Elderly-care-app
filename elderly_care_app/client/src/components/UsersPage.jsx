import { useEffect, useState } from 'react';
import axios from 'axios';
import UserInvite from './UserInvite';
import '../styles/UserPage.css';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedRole, setEditedRole] = useState('');

  // Get current user info from localStorage
  const currentUserRole = localStorage.getItem('userRole');
  const currentUserId = JSON.parse(localStorage.getItem('userInfo'))?._id;

  // Determine if current user can edit/add/delete users
  const canEditUsers = currentUserRole !== 'caregiver' && currentUserRole !== 'family';

  // Function to broadcast permission changes
  const broadcastPermissionChange = () => {
    const event = new CustomEvent('permissionsChanged', {
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  };

  // Function to update localStorage and broadcast changes
  const updateUserPermissions = (isContributor, isViewOnly) => {
    localStorage.setItem('isContributor', String(isContributor));
    localStorage.setItem('isViewOnly', String(isViewOnly));
    broadcastPermissionChange();
  };
  
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/contactusers', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
      });
      setUsers(res.data);

      // Update current user's permissions in localStorage if they exist in the users list
      const currentUser = res.data.find(user => user._id === currentUserId);
      if (currentUser) {
        updateUserPermissions(currentUser.isContributor, currentUser.isViewOnly);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/contactusers/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('userToken')}`,
        },
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user', err);
    }
  };

  const toggleContributor = async (id, isContributor) => {
    const user = users.find(u => u._id === id);
    const isViewOnly = user?.isViewOnly ?? false;

    // Optimistically update UI and permissions
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user._id === id ? { ...user, isContributor } : user
      )
    );

    // If this is the current user, update permissions immediately
    if (id === currentUserId) {
      updateUserPermissions(isContributor, isViewOnly);
    }

    try {
      await axios.put(
        `http://localhost:8000/api/contactusers/${id}`,
        {
          isContributor,
          isViewOnly
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`,
          },
        }
      );
    } catch (err) {
      console.error('Failed to update contributor status', err);
      // Revert the UI change and permissions on error
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === id ? { ...user, isContributor: !isContributor } : user
        )
      );
      if (id === currentUserId) {
        updateUserPermissions(!isContributor, isViewOnly);
      }
    }
  };

  const toggleViewOnly = async (id, isViewOnly) => {
    const user = users.find(u => u._id === id);
    const isContributor = user?.isContributor ?? false;

    // Optimistically update UI and permissions
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user._id === id ? { ...user, isViewOnly } : user
      )
    );

    // If this is the current user, update permissions immediately
    if (id === currentUserId) {
      updateUserPermissions(isContributor, isViewOnly);
    }

    try {
      await axios.put(
        `http://localhost:8000/api/contactusers/${id}`,
        {
          isViewOnly,
          isContributor
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`,
          },
        }
      );
    } catch (err) {
      console.error('Failed to update view only status', err);
      // Revert the UI change and permissions on error
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === id ? { ...user, isViewOnly: !isViewOnly } : user
        )
      );
      if (id === currentUserId) {
        updateUserPermissions(isContributor, !isViewOnly);
      }
    }
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(
        `http://localhost:8000/api/contactusers/${id}`,
        {
          fullname: editedName,
          email: editedEmail,
          role: editedRole,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`,
          },
        }
      );
      setEditingUserId(null);
      setEditedName('');
      setEditedEmail('');
      setEditedRole('');
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user', err);
    }
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditedName('');
    setEditedEmail('');
    setEditedRole('');
  };

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  const handleInviteClose = () => {
    setInviteOpen(false);
    // Trigger a refresh when the invite modal closes
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="userPage-container">
      {canEditUsers && (
        <button onClick={() => setInviteOpen(true)} className="add-user-button">
          Add User
        </button>
      )}

      {isInviteOpen && (
        <UserInvite 
          isOpen={isInviteOpen} 
          onClose={handleInviteClose}
          onUserAdded={fetchUsers}
        />
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr className="table-header-row">
              <th className="table-header-cell">Full Name</th>
              <th className="table-header-cell">Email</th>
              <th className="table-header-cell">Role</th>
              <th className="table-header-cell">Restriction</th>
              <th className="table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="table-row">
                <td className="table-cell" data-label="Full Name">
                  {editingUserId === user._id && canEditUsers ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    user.fullname
                  )}
                </td>
                <td className="table-cell" data-label="Email">
                  {editingUserId === user._id && canEditUsers ? (
                    <input
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td className="table-cell" data-label="Role">
                  {editingUserId === user._id && canEditUsers ? (
                    <input
                      type="text"
                      value={editedRole}
                      onChange={(e) => setEditedRole(e.target.value)}
                      className="edit-input"
                    />
                  ) : (
                    user.role
                  )}
                </td>
                <td className="table-cell" data-label="Restriction">
                  <div className="restriction-cell">
                    <label className="checkbox-label" style={{ color: '#000000' }}>
                      <input
                        type="checkbox"
                        checked={!!user.isContributor}
                        onChange={e => toggleContributor(user._id, e.target.checked)}
                        className="checkbox-input"
                        disabled={!canEditUsers}
                      />
                      <span style={{ color: '#000000' }}>Contributor</span>
                    </label>
                    <label className="checkbox-label" style={{ color: '#000000' }}>
                      <input
                        type="checkbox"
                        checked={!!user.isViewOnly}
                        onChange={e => toggleViewOnly(user._id, e.target.checked)}
                        className="checkbox-input"
                        disabled={!canEditUsers}
                      />
                      <span style={{ color: '#000000' }}>View Only</span>
                    </label>
                  </div>
                </td>
                <td className="table-cell" data-label="Actions">
                  <div className="actions-cell">
                    {editingUserId === user._id && canEditUsers ? (
                      <>
                        <button
                          className="action-button action-button-save"
                          onClick={() => saveEdit(user._id)}
                        >
                          Save
                        </button>
                        <button
                          className="action-button action-button-cancel"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      canEditUsers && (
                        <>
                          <button
                            className="action-button action-button-edit"
                            onClick={() => {
                              setEditingUserId(user._id);
                              setEditedName(user.fullname);
                              setEditedEmail(user.email);
                              setEditedRole(user.role);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="action-button action-button-delete"
                            onClick={() => handleDelete(user._id)}
                          >
                            Delete
                          </button>
                        </>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserPage;
