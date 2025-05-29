import nodemailer from 'nodemailer';

import Medication from '../models/Medication.js';
import ContactUser from '../models/ContactUser.js';
import MainUser from '../models/MainUser.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const addMedication = async (req, res) => {
  try {
    const { medicine, time, day, date } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Missing user ID. Please log in again.' });
    }

    const newMedication = new Medication({
      medicine,
      time,
      day,
      date,
      user_id: req.user.id,
      taken: false,
    });

    await newMedication.save();
    res.status(201).json({ message: 'Medication added', medication: newMedication });
  } catch (error) {
    console.error('Add medication error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMedications = async (req, res) => {
  try {
    const userRole = req.user.role;
    let medications;
    if (userRole === 'admin' || userRole === 'family' || userRole === 'caregiver') {
      medications = await Medication.find({});
    } else {
      medications = await Medication.find({ user_id: req.user.id });
    }

    res.json(medications);
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ error: 'Server error while fetching medications' });
  }
};

export const updateMedication = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    if (typeof updateData.taken !== 'undefined') {
      updateData.takenAt = updateData.taken ? new Date() : null;
    }

    const medication = await Medication.findByIdAndUpdate(id, updateData, { new: true });
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }

    if (typeof updateData.taken !== 'undefined') {
      const userDetails = await MainUser.findById(req.user.id).select('fullname role');
      const fullname = userDetails?.fullname || 'User';
      const role = userDetails?.role || 'User';

      const familyUsers = await ContactUser.find({ role: 'family', isActive: true });
      const adminUsers = await MainUser.find({ role: 'admin' });

      const recipients = [
        ...familyUsers.map(user => user.email),
        ...adminUsers.map(user => user.email),
      ];

      if (recipients.length > 0) {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: recipients,
          subject: 'Elderly App Notification - Medication Taken',
          html: `
            <p><strong>${fullname}</strong> (${role}) updated medication status.</p>
            <p>Medication: <strong>${medication.medicine}</strong></p>
            <p>Status: <strong>${medication.taken ? 'Taken' : 'Not Taken'}</strong></p>
            <p>Timestamp: ${new Date().toLocaleString()}</p>
          `,
        });
      }
    }

    res.json(medication);
  } catch (error) {
    console.error('Error updating medication:', error);
    res.status(500).json({ error: 'Server error while updating medication' });
  }
};

export const deleteMedication = async (req, res) => {
  const { id } = req.params;

  try {
    const medication = await Medication.findByIdAndDelete(id);
    if (!medication) {
      return res.status(404).json({ error: 'Medication not found' });
    }
    res.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    console.error('Error deleting medication:', error);
    res.status(500).json({ error: 'Server error while deleting medication' });
  }
};