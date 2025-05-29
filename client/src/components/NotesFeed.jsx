import { useContext, useEffect } from "react";
import "../styles/NotesFeed.css";
import NoteModal from "./modals/NoteModal"; 
import { NotesContext } from "../context/NotesContext";
import { ACTION_TYPES } from "../action-types/actionTypes";
import { checkPermissions } from '../utils/permissions';

const NotesFeed = () => {
  const { state, dispatch, addNotesToDb, deleteNotesToDb, updateNoteInDb, capitalizeSentence, fetchUserNotes } = useContext(NotesContext);
  const { isEdit, currentNote, showModal, notes } = state;
  const { canAdd, canEdit, canDelete } = checkPermissions();

  // Listen for permission changes
  useEffect(() => {
    const handlePermissionChange = () => {
      console.log("Permissions changed, refreshing notes...");
      fetchUserNotes();
    };

    window.addEventListener('permissionsChanged', handlePermissionChange);

    return () => {
      window.removeEventListener('permissionsChanged', handlePermissionChange);
    };
  }, [fetchUserNotes]);

  // Open Add Note Modal
  const handleAddClick = () => {
    if (!canAdd) {
      alert("You don't have permission to add notes");
      return;
    }
    dispatch({type: ACTION_TYPES.SET_IS_EDIT, payload: false});
    dispatch({type: ACTION_TYPES.SET_CURRENT_NOTE, payload: {_id: null, title: "", description: ""} });
    dispatch({ type: ACTION_TYPES.SET_MODAL_VISIBILITY, payload: true});
  };

  // Open Edit Note Modal
  const handleNoteClick = (note) => {
    if (!canEdit) {
      return; // Just view the note, don't open edit modal
    }
    dispatch({type: ACTION_TYPES.SET_IS_EDIT, payload: true});
    dispatch({type: ACTION_TYPES.SET_CURRENT_NOTE, payload: note });
    dispatch({ type: ACTION_TYPES.SET_MODAL_VISIBILITY, payload: true});
  };

  // Save Note (Add or Update)
  const handleSave = async () => {
    // Validate the note data and prevent empty notes
    if (!currentNote.title.trim() || !currentNote.description.trim()) {
      alert("Please add title and description");
      return;
    }

    try {
      if (currentNote._id) {
        if (!canEdit) {
          alert("You don't have permission to edit notes");
          return;
        }
        await updateNoteInDb(currentNote);
      } else {
        if (!canAdd) {
          alert("You don't have permission to add notes");
          return;
        }
        await addNotesToDb({ ...currentNote });
      }
      dispatch({ type: ACTION_TYPES.SET_MODAL_VISIBILITY, payload: false });
    } catch (error) {
      console.error("Failed to save note:", error);
      alert(error.response?.data?.message || "Failed to save note");
    }
  };

  const handleDelete = async (noteId) => {
    if (!canDelete) {
      alert("You don't have permission to delete notes");
      return;
    }

    try {
      if (window.confirm("Are you sure you want to delete this note?")) {
        await deleteNotesToDb(noteId);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      alert(error.response?.data?.message || "Failed to delete note");
    }
  };

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h2 className="notes-title">Shared Notes</h2>
        {canAdd && (
          <button 
            onClick={handleAddClick}
            className="add-note-button"
          >
            Add Note
          </button>
        )}
      </div>

      <div className="notes-content">
        {notes.length === 0 ? (
          <p className="empty-notes">No notes yet.</p>
        ) : (
          [...notes]
            .sort((a,b) => new Date(b.date) - new Date(a.date))
            .map((note) => (
              <div
                key={note._id || `temp-${Date.now()}-${Math.random()}`}
                className={`note-card ${canEdit ? 'editable' : ''}`}
                onClick={() => canEdit && handleNoteClick(note)}
              >
                <div className="note-content">
                  <div className="note-header">
                    <span className="note-metadata">
                      {new Date(note.date).toLocaleString()}
                    </span>
                    {note.created_by && (
                      <span className="note-metadata capitalize">
                        By: {note.created_by.fullname}
                      </span>
                    )}
                  </div>
                  <h4 className="note-title">{note.title}</h4>
                  <p className="note-description">
                    {capitalizeSentence(note.description)}
                  </p>
                </div>

                {canDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(note._id);
                    }}
                    className="delete-button"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))
        )}
      </div>

      {showModal && (
        <NoteModal
          isEdit={isEdit}
          currentNote={currentNote}
          setCurrentNote={(note) => dispatch({ type: ACTION_TYPES.SET_CURRENT_NOTE, payload: note})}
          onSave={handleSave}
          onClose={() => dispatch({ type: ACTION_TYPES.SET_MODAL_VISIBILITY, payload: false})}
        />
      )}
    </div>
  );
};

export default NotesFeed;