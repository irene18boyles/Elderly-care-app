import express from 'express';
import {
    addMedicalRecord,
    getAllMedicalRecords,
    uploadFile,
    updateMedicalRecord,
    deleteMedicalRecord,
    downloadFile
 } from '../controller/medicalRecordControllers.js';
import upload from '../config/cloudinary.js'; // use import instead of require // middleware

const router = express.Router();

router.get('/getAllRecords', getAllMedicalRecords);

router.post('/addRecord', addMedicalRecord);

// Upload route
router.post('/upload', upload.single('file'), uploadFile);

// update route
router.put('/update/:id', updateMedicalRecord);

// delete route
router.delete('/delete/:id', deleteMedicalRecord);

// download route
router.get('/download/:recordId', downloadFile);

export default router;