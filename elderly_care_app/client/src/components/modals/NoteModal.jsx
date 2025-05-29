import '../../styles/Global.css';
import { checkPermissions } from '../../utils/permissions';

const NoteModal = ({
  isEdit,
  currentNote,
  setCurrentNote,
  onSave,
  onClose
}) => {
  const { canAdd, canEdit } = checkPermissions();

  // Check permissions
  if ((isEdit && !canEdit) || (!isEdit && !canAdd)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 modal-overlay">
        <div className="p-6 rounded-xl shadow-lg w-11/12 max-w-md bg-white">
          <h3 className="text-xl font-semibold mb-4 text-red-600">
            Permission Denied
          </h3>
          <p className="text-center mb-4">
            You don't have permission to {isEdit ? 'edit' : 'add'} notes.
          </p>
          <div className="flex justify-center">
            <button className="modal-button-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 modal-overlay">
      <div className="p-6 rounded-xl shadow-lg w-11/12 max-w-md bg-white">
        <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--primary)' }}>
          {isEdit ? 'Edit Note' : 'Add Note'}
        </h3>
        <input
          type="text"
          placeholder="Title"
          value={currentNote.title}
          onChange={e => setCurrentNote({ ...currentNote, title: e.target.value })}
          className="w-full mt-2 mb-3 p-2 border rounded-md"
          style={{ borderColor: 'var(--accent)' }}
        />
        <textarea
          placeholder="Description"
          value={currentNote.description}
          onChange={e => setCurrentNote({ ...currentNote, description: e.target.value })}
          className="w-full mt-2 mb-4 p-2 border rounded-md h-24"
          style={{ borderColor: 'var(--accent)' }}
        />
        <div className="flex justify-end gap-4">
          <button onClick={onSave}>
            {isEdit ? 'Update' : 'Save'}
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;