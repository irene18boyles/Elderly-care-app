import '../../styles/Global.css';

export default function SymptomModal({
  selectedSymptomName,
  symptoms,
  canDelete,
  onClose,
  onDelete,
}) {
  const filteredSymptoms = symptoms.filter(s => s.name === selectedSymptomName);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Symptoms: {selectedSymptomName}</h3>
        {filteredSymptoms.length === 0 ? (
          <p>No symptoms found.</p>
        ) : (
          <ul>
            {filteredSymptoms.map((s, index) => (
              <li key={s._id ?? `${s.name}-${index}`} className="symptom-item">
                <p><strong>Description:</strong> {s.description}</p>
                <p><small>{new Date(s.dateLogged).toLocaleString()}</small></p>
                {canDelete && (
                  <button
                    className="delete-btn"
                    onClick={() => onDelete(s._id)}
                  >
                    Delete
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
