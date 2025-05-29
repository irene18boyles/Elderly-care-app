import mongoose from 'mongoose';

const symptomSchema = new mongoose.Schema({
  name: String,
  description: String,
  elderlyPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'ElderlyPerson' },
  loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'MainUser' },
  dateLogged: { type: Date, default: Date.now }
});

export default mongoose.model('Symptom', symptomSchema);
