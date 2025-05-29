import Appointment from '../models/Appointment.js';

// Create a new appointment
export const createAppointment = async (req, res) => {
  try {
    const { title, description, location, date, time, assignedTo } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!userId || !userRole) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const newAppointment = new Appointment({
      title,
      description,
      location,
      date,
      time,
      assignedTo,
      createdBy: userId,
    });

    await newAppointment.save();
    res.status(201).json({ success: true, appointment: newAppointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create appointment' });
  }
};

// Get upcoming appointments
export const getUpcomingAppointments = async (req, res) => {
  try {
    const now = new Date();
    const appointments = await Appointment.find({
      date: { $gte: now },
      status: 'scheduled'
    })
    .sort({ date: 1, time: 1 })
    .limit(5)
    .populate('assignedTo', 'fullname email role')
    .populate('createdBy', 'fullname email role');

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching upcoming appointments' });
  }
};

// Get all appointments for a specific date
export const getAppointmentsByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const appointments = await Appointment.find({ date }).populate('assignedTo createdBy', 'fullname email role');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

// Update
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Only the creator or main user can edit
    const isCreator = appointment.createdBy.toString() === userId;
    const isAdmin = userRole === 'admin';

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this appointment' });
    }

    const updated = await Appointment.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
};

// Delete
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only main user can delete appointments' });
    }

    const deleted = await Appointment.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Appointment not found' });

    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
};

// Assign users (admin only)
export const assignUsersToAppointment = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can assign users' });
    }

    const { id } = req.params;
    const { assignedTo } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    appointment.assignedTo = assignedTo;
    await appointment.save();

    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to assign user' });
  }
};