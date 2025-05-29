import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  location: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'userModel',
    required: true
  }],
  userModel: {
    type: String,
    required: true,
    enum: ['MainUser', 'ContactUser']
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  lastReminderDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MainUser', // The creator of the appointment
    required: true
  }
}, {
  timestamps: true // Automatically manage createdAt and updatedAt fields
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;