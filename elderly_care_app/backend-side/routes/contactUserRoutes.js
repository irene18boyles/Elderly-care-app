import express from 'express';
import { inviteUser, acceptInvite, getAllContactUsers, deleteContactUser, updateContactUser, setPassword, loginContactUser } from '../controller/contactUserControllers.js';
import {authMiddleware} from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/user-invite', authMiddleware, inviteUser);
router.get('/accept-invite', acceptInvite);
router.get('/', authMiddleware, getAllContactUsers);
router.delete('/:id', authMiddleware, deleteContactUser);
router.put('/:id', authMiddleware, updateContactUser)
router.post('/set-password', setPassword)
router.post('/login', loginContactUser)
export default router;
