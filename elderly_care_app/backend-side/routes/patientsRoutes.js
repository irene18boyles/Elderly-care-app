import express from 'express';
import { getPatientDetails, updatePatientDetails } from '../controller/patientsDetailsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to get patient details
router.get('/getdetails', authMiddleware, getPatientDetails)

router.put('/updatedetails', authMiddleware, updatePatientDetails)

export default router;