import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    medicine: {
        type: String,
        required: true,
    },
    time: {
        type: String,
        required: true,
    },
    day: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    taken: {
        type: Boolean,
        default: false,
    },
    takenAt: { type: Date, default: null}
})
    

const Medication = mongoose.model('Medication', medicationSchema)
export default Medication;