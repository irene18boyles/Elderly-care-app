import mongoose, { Schema } from "mongoose";

const medicalrecordSchema = new Schema({
    description: {
        type: String,
        required: true,
    },
    doctorName: {
        type: String,
        required: true,  
    },
    category: {
        type: String,
        // required: true,
        enum: [
            'Prescriptions',
            'Laboratory Results',
            'Imaging Results',
            'Cardiology',
            'Surgical Reports',
            'Clinical Notes',
            'Endoscopy Reports',
            'Pathology & Cytology',
            'Vital Signs & Measurements',
            'Vaccination Records',
            'Allergy & Sensitivity Tests',
            'Dermatology Reports',
            'Neurological Tests',
            'Pulmonary',
            'Obstetrics and Gynecology',
            'Audiology & Vision',
            'Oncology Reports',
            'Psychiatric Evaluations'
        ]
    },
    fileUrl: {
        type: String,
        // required: true,
    },
    uploadAt: {
        type: Date,
        default: Date.now
    },
    originalName: { // stores original name of file upload
        type: String,
    }, 
    mimeType: {
        type: String, // e.g image/jpeg, application/pdf
    } ,


})

const MedicalRecord = mongoose.model('MedicalRecord', medicalrecordSchema)
export default MedicalRecord