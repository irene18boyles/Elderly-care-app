import express from 'express'; // for routing
import {getAllNotesFeed, getUserNotesFeed, addNote, deleteNote, updateNote } from '../controller/notesFeedController.js';
import {authMiddleware} from '../middleware/authMiddleware.js';

const router = express.Router()

// Protected routes - require authentication
router.get('/allusernotes', authMiddleware, getUserNotesFeed) //getAllNotesFeed is from controller

router.get('/allnotes', authMiddleware, getAllNotesFeed) //getAllNotesFeed is from controller

router.post('/addnote', authMiddleware, addNote) // addd notes

router.delete('/delete/:id', authMiddleware, deleteNote) // delete notes

router.put('/update/:id', authMiddleware, updateNote) // update notes


export default router