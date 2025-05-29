import React, { useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { Download, Edit, Trash2, Save, X } from "lucide-react";
import "../../styles/Global.css";

const categories = [
  "Prescriptions",
  "Laboratory Results",
  "Imaging Results",
  "Cardiology",
  "Surgical Reports",
  "Clinical Notes",
  "Endoscopy Reports",
  "Pathology & Cytology",
  "Vital Signs & Measurements",
  "Vaccination Records",
  "Allergy & Sensitivity Tests",
  "Dermatology Reports",
  "Neurological Tests",
  "Pulmonary",
  "Obstetrics and Gynecology",
  "Audiology & Vision",
  "Oncology Reports",
  "Psychiatric Evaluations",
].map((category) => ({ label: category, value: category }));

export default function MedicalRecordsModal({
  record,
  onClose,
  onUpdate,
  onDelete,
  canEdit,
  canDelete,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState({
    description: record.description,
    doctorName: record.doctorName,
    category: { label: record.category, value: record.category },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (selectedOption) => {
    setForm({ ...form, category: selectedOption });
  };

  const handleSave = async () => {
    if (!canEdit) {
      toast.error("You don't have permission to edit records");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(
        `http://localhost:8000/api/medicalrecords/update/${record._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            description: form.description,
            doctorName: form.doctorName,
            category: form.category?.value || record.category,
          }),
        }
      );

      if (!response.ok) {
        const errResponse = await response.json();
        throw new Error("Failed to update record");
      }

      const updated = await response.json();
      toast.success("Record updated successfully");
      onUpdate(updated);
      setIsEditing(false);
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Error updating record");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) {
      toast.error("You don't have permission to delete records");
      return;
    }

    try {
      const token = localStorage.getItem("userToken");
      const response = await fetch(
        `http://localhost:8000/api/medicalrecords/delete/${record._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete record");
      }

      toast.success("Record deleted successfully");
      onDelete(record._id);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Error deleting record");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 modal-overlay">
      <div className="bg-[var(--light)] rounded-xl shadow-lg w-[90%] md:w-[60%] max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X />
        </button>
        <h2 className="text-xl font-semibold mb-4">Medical Record Details</h2>

        <div className="space-y-3">
          <div>
            <label className="font-medium font-semibold text-[var(--primary)]">Description:</label>
            {isEditing ? (
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 mt-1 text-[var(--light)]"
              />
            ) : (
              <p className="text-gray-700">{record.description}</p>
            )}
          </div>

          <div>
            <label className="font-medium ">Doctor Name:</label>
            {isEditing ? (
              <input
                name="doctorName"
                value={form.doctorName}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1 mt-1"
              />
            ) : (
              <p className="text-gray-700">{record.doctorName}</p>
            )}
          </div>

          <div>
            <label className="font-medium">Category:</label>
            {isEditing ? (
              <Select
                value={form.category}
                onChange={handleCategoryChange}
                options={categories}
                className="mt-1"
              />
            ) : (
              <p className="text-gray-700">{record.category}</p>
            )}
          </div>

          <div>
            <label className="font-medium">Uploaded:</label>
            <p className="text-gray-700">
              {new Date(record.uploadAt).toLocaleString()}
            </p>
          </div>

          {record.fileUrl && (
            <div>
              <label className="font-medium">Document Preview:</label>
              <iframe
                src={record.fileUrl}
                title="Medical Document"
                className="w-[100%] min-h-[70vh] mt-2"
              ></iframe>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6 space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" /> {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </button>
              )}
              {record.fileUrl && (
                <a
                  href={`http://localhost:8000/api/medicalrecords/download/${record._id}`}
                  rel="noopener noreferrer"
                  download
                  className="flex items-center text-blue-600 hover:underline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span className="sr-only">Download</span>
                </a>
              )}
            </>
          )}
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <p className="mb-4">
                Are you sure you want to delete this record?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
