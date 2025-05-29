import React, { useState, useEffect } from "react";
import { checkPermissions } from "../utils/permissions";
import UploadMedicalRecordsModal from "./modals/UploadMedicalRecordsModal";
import MedicalRecordsModal from "./modals/MedicalRecordsModal";
import "../styles/MedicalRecords.css";

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [error, setError] = useState("");

  // Get permissions
  const { canAdd, canEdit, canDelete, canView } = checkPermissions();

  // Fetch records from the API when the component adds
  const fetchRecords = () => {
    fetch("https://elderly-care-app.onrender.com/api/medicalrecords/getAllRecords", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('userToken')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setRecords(data);
        setFilteredRecords(data);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Failed to fetch medical records");
      });
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    let filtered = [...records];

    if (categoryFilter) {
      filtered = filtered.filter((r) => r.category === categoryFilter);
    }
    if (monthFilter) {
      filtered = filtered.filter((r) => new Date(r.createdAt).getMonth() + 1 === parseInt(monthFilter));
    }
    if (yearFilter) {
      filtered = filtered.filter((r) => new Date(r.createdAt).getFullYear() === parseInt(yearFilter));
    }

    setFilteredRecords(filtered);
  }, [categoryFilter, monthFilter, yearFilter, records]);

  const handleRecordClick = (record) => {
    if (!canView) {
      setError("You don't have permission to view record details");
      return;
    }
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const handleRecordUpdate = (updatedRecord) => {
    fetchRecords();
    setShowDetailsModal(false);
  };

  const handleRecordDelete = (deletedId) => {
    setRecords((prev) => prev.filter((r) => r._id !== deletedId));
    setShowDetailsModal(false);
  };

  const categories = [
    "Prescriptions", "Laboratory Results", "Imaging Results", "Cardiology",
    "Surgical Reports", "Clinical Notes", "Endoscopy Reports", "Pathology & Cytology",
    "Vital Signs & Measurements", "Vaccination Records", "Allergy & Sensitivity Tests",
    "Dermatology Reports", "Neurological Tests", "Pulmonary", "Obstetrics and Gynecology",
    "Audiology & Vision", "Oncology Reports", "Psychiatric Evaluations"
  ];

  if (!canView) {
    return (
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-6 mr-70 ml-70" style={{ color: 'var(--primary)' }}>Medical Records</h1>
        <p className="text-red-600">You don't have permission to view medical records.</p>
      </div>
    );
  }

  return (
    <div className="medical-records-page">
      <h1 className="medical-records-title">Medical Records</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="filters-section">
        <select
          className="filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        >
          <option value="">All Months</option>
          {[...Array(12)].map((_, idx) => (
            <option key={idx + 1} value={idx + 1}>
              {new Date(0, idx).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          <option value="">All Years</option>
          {[2022, 2023, 2024, 2025].map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      
      {canAdd && (
        <div className="upload-button-container">
          <button
            onClick={() => setShowUploadModal(true)}
            className="upload-button"
          >
            Upload
          </button>
        </div>
      )}

      <div className="records-grid">
        {filteredRecords.length === 0 ? (
          <p className="no-records">No medical records found.</p>
        ) : (
          filteredRecords.map((record) => (
            <div
              key={record._id}
              onClick={() => handleRecordClick(record)}
              className="record-card"
            >
              <p className="record-title">{record.description}</p>
              <p className="record-info">Doctor: {record.doctorName}</p>
              <p className="record-info">Category: {record.category}</p>
              <p className="record-info">
                Uploaded: {new Date(record.uploadAt).toLocaleString()}
              </p>
              {record.fileUrl && (
                <div className="mt-2">
                  <a
                    href={`https://elderly-care-app.onrender.com/api/medicalrecords/download/${record._id}`}
                    className="download-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Download
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadMedicalRecordsModal
          onClose={() => setShowUploadModal(false)}
          onUpload={() => {
            fetchRecords();
            setShowUploadModal(false);
          }}
          canAdd={canAdd}
        />
      )}

      {/* View/Edit Modal */}
      {showDetailsModal && selectedRecord && (
        <MedicalRecordsModal
          record={selectedRecord}
          onClose={() => setShowDetailsModal(false)}
          onUpdate={handleRecordUpdate}
          onDelete={handleRecordDelete}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}
    </div>
  );
}