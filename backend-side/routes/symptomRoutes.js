import express from 'express';
import { getSymptoms, createSymptom, deleteSymptom, getSymptomTrends, getAISuggestion } from '../controller/symptomController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getSymptoms);
router.post('/', authMiddleware, createSymptom);
router.get('/trends', authMiddleware, getSymptomTrends);
router.delete('/:id', authMiddleware, deleteSymptom);
router.post('/ai-suggestion', authMiddleware, getAISuggestion);

export default router;
