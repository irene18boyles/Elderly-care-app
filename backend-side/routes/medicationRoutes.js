import express from 'express';
import {
  addMedication,
  getMedications,
  updateMedication,
  deleteMedication
} from '../controller/medicationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/medications', authMiddleware, addMedication);
router.get('/medications', authMiddleware, getMedications);
router.put('/medications/:id', authMiddleware, updateMedication);
router.delete('/medications/:id', authMiddleware, deleteMedication);
router.patch('/toggle/:id', authMiddleware, updateMedication);

export default router;
