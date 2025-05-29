// import React, { useEffect, useState } from "react";

// export default function MedicalRecordsList() {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  

//   useEffect(() => {
//     fetch("http://localhost:8000/api/medicalrecords/getAllRecords") // your GET endpoint
//       .then((res) => {
//         if (!res.ok) throw new Error("Failed to fetch records");
//         return res.json();
//       })
//       .then((data) => {
//         setRecords(data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         setError(err.message);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <p>Loading records...</p>;
//   if (error) return <p>Error: {error}</p>;

//    return (
//     <div>
//       <h2>Uploaded Medical Records</h2>
//       {records.length === 0 ? (
//         <p>No records found.</p>
//       ) : (
//         <ul>
//           {records.map((record) => (
//             <li key={record._id} style={{ marginBottom: "1rem" }}>

//               <p><strong>Description:</strong> {record.description}</p>
//               <p><strong>Doctor:</strong> {record.doctorName}</p>
//               <p><strong>Category:</strong> {record.category}</p>
//               <p><strong>Fila Name:</strong> {record.originalName}</p>

//               {record.fileUrl && (
//                 <>
//                 <a href={record.fileUrl} rel="noopener noreferrer" download={record.originalName}>
//                   View |
//                 </a>
                
//                 <a href={`http://localhost:8000/api/medicalrecords/download/${record._id}`} rel="noopener noreferrer" >
//                     Download
//                 </a>
//                 </>
//               )}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }




import React, { useEffect, useState } from "react";
import MedicalRecordsModal from "../components/modals/MedicalRecordsModal";
import "../styles/Global.css";

export default function MedicalRecordsList() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/medicalrecords/getAllRecords");
        if (!res.ok) throw new Error("Failed to fetch records");
        const data = await res.json();
        setRecords(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const handleUpdate = (updatedRecord) => {
    setRecords((prev) =>
      prev.map((rec) => (rec._id === updatedRecord._id ? updatedRecord : rec))
    );
    setSelectedRecord(null);
  };

  const handleDelete = (deletedId) => {
    setRecords((prev) => prev.filter((rec) => rec._id !== deletedId));
    setSelectedRecord(null);
  };

  if (loading) return <p>Loading records...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="p-4 bg">
      <h2 className="text-2xl font-semibold mb-4">Uploaded Medical Records</h2>

      {records.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.map((record) => (
            <div
              key={record._id || `temp-${Date.now()}-${Math.random()}`}
              className="border p-4 rounded-xl shadow hover:shadow-md transition bg-white flex flex-col gap-1 cursor-pointer"
              style={{
                backgroundColor: "var(--medium)",
                border: "1px solid var(--accent)",
                color: "white",
              }}
              onClick={() => setSelectedRecord(record)}
            >
              <div><strong>Description:</strong> {record.description}</div>
              <div><strong>Doctor:</strong> {record.doctorName}</div>
              <div><strong>Category:</strong> {record.category}</div>
              <div><strong>File Name:</strong> {record.originalName}</div>
              <div className="text-sm mt-2">
                <a
                  href={record.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline mr-3"
                >
                  View
                </a>
                <a
                  href={`http://localhost:8000/api/medicalrecords/download/${record._id}`}
                  className="text-blue-600 hover:underline"
                >
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRecord && (
        <MedicalRecordsModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
