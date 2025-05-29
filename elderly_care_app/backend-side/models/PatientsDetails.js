import mongoose, { Schema } from "mongoose";

const patientsdetailsSchema = new Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainUser',
        required: true,
        unique: true,
    },
    patientFullName: {
        type: String,
        default: "",
    },  
    age: {
        type: String,
        default: "",
    },
    gender: {
        type: String,
        default: "",
        enum: ['Female', 'Male', 'Other']
    },
    dateOfBirth: {
        type: Date,
        default: null,
    },
    bloodtype: {
        type: String,
        default: "",
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    weight: {
        type: Number,
        default: null,
    },
    height: {
        type: Number,
        default: null,
    },
    allergies: {
        type: String,
        default: "",
    },
    medicalConditions: {
        type: String,
        default: "",
    },
    medications: {
        type: String,
        default: "",
    },
    emergencyContact: {
        name: {
            type: String,
            default: "",
        },
        relationship: {
            type: String,
            default: "",
        },
        phoneNumber: {
            type: String,
            default: "",
        }
    },
}, { timestamps: true });

const PatientsDetail = mongoose.model('PatientsDetail', patientsdetailsSchema)
export default PatientsDetail