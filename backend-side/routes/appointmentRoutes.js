import express from 'express';
import {
  createAppointment,
  getAppointmentsByDate,
  updateAppointment,
  deleteAppointment,
  assignUsersToAppointment,
  getUpcomingAppointments
} from '../controller/appointmentController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createAppointment);
router.get('/by-date', authMiddleware, getAppointmentsByDate);
router.get('/upcoming', authMiddleware, getUpcomingAppointments);
router.put('/:id', authMiddleware, updateAppointment);
router.delete('/:id', authMiddleware, deleteAppointment);
router.post('/:id/assign', authMiddleware, assignUsersToAppointment);

export default router;