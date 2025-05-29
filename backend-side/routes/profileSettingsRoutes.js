import express from'express';
import { getProfileDetails, updatePassword, updateProfileDetails } from '../controller/profileSettingsController.js';  // import functions from controller
import { authMiddleware } from '../middleware/authMiddleware.js';
const router = express.Router();

router.get('/settings', authMiddleware, getProfileDetails )

router.put('/updatesettings', authMiddleware, updateProfileDetails)

router.put('/changepassword', authMiddleware, updatePassword)

export default router;