import PatientsDetail from "../models/PatientsDetails.js";
import mongoose, {Schema, Types} from "mongoose";


////////////////////////
// Fetch patient details 
////////////////////////

const getPatientDetails = async(req, res) => {
    try {
        const patientId = req.user.id; // Get the token
        const patientDetails = await PatientsDetail.findOne({ patientId });

        if (!patientDetails) {
            return res.status(404).json({ message: "Patient details not found" });
        }

        res.status(200).json({
            message: "Patient details fetched successfully",
            data: patientDetails
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching patient details",
            error: error.message
        });
    }
}
const updatePatientDetails = async (req, res) => {
    try {
        const patientId = req.user.id;
        const updatedDetails = { ...req.body };

        // Convert string numbers to actual numbers for numeric fields
        if (updatedDetails.weight) updatedDetails.weight = Number(updatedDetails.weight);
        if (updatedDetails.height) updatedDetails.height = Number(updatedDetails.height);

        // Convert date string to Date object if present
        if (updatedDetails.dateOfBirth) updatedDetails.dateOfBirth = new Date(updatedDetails.dateOfBirth);

        // Defensive: ensure emergencyContact is an object
        if (updatedDetails.emergencyContact && typeof updatedDetails.emergencyContact !== "object") {
            updatedDetails.emergencyContact = {};
        }

        const updatedPatient = await PatientsDetail.findOneAndUpdate(
            { patientId: new mongoose.Types.ObjectId(patientId) },
            updatedDetails,
            { new: true, runValidators: true }
        );

        if (!updatedPatient) {
            return res.status(404).json({ message: "Patient details not found" });
        }

        res.status(200).json({
            message: "Patient details updated successfully",
            data: updatedPatient
        });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({
            message: "Error updating patient details",
            error: error.message
        });
    }
}


export { getPatientDetails, updatePatientDetails };