import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import ContactUser from '../models/ContactUser.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const inviteUser = async (req, res) => {
  try {
    const { fullname, email, role } = req.body;

    const existing = await ContactUser.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Contact already invited' });
    }

    const invitationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '3d' });

    const newContact = new ContactUser({
      fullname,
      email,
      role,
      created_by: req.user.id,
      invitationToken,
      isActive: false,
    });

    await newContact.save();

    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invite?token=${invitationToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Invitation to Elderly App',
      html: `
        <h3>Hello ${fullname},</h3>
        <p>You have been invited to join the Elderly App as a <strong>${role}</strong>.</p>
        <p>Click the button below to accept your invite and activate your account:</p>
        <a href="${invitationLink}">Accept Invite</a>
        <p>This link will expire in 3 days.</p>
      `,
    });

    res.json({ message: 'Invitation sent' });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const acceptInvite = async (req, res) => {
  const { token } = req.query;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await ContactUser.findOne({ email: payload.email });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      user.isActive = true;
      user.invitationToken = null;
      await user.save();
    }

    const loginToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role, fullname: user.fullname },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token: loginToken,
      user: {
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        isContributor: user.isContributor,
        isViewOnly: user.isViewOnly,
        _id: user._id
      },
      message: "Invite accepted. Please set your password."
    });
  } catch (error) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
};

export const setPassword = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token missing" });
  }
  const token = authHeader.split(" ")[1];
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await ContactUser.findOne({ _id: payload.id, email: payload.email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: 'User is not active yet' });
    }

    // Hash and save the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Generate a new token with updated user data
    const newToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role, fullname: user.fullname },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Return complete user data
    res.status(200).json({
      message: 'Password set successfully',
      token: newToken,
      user: {
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        isContributor: user.isContributor,
        isViewOnly: user.isViewOnly,
        _id: user._id
      }
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

export const loginContactUser = async (req, res) => {
  const {email, password } = req.body;
  try {
    const user = await ContactUser.findOne({
      email, role: { $in: ['family', 'caregiver']}
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: 'Account not activated. Please accept the invite first.' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'Please set your password before logging in.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, fullname: user.fullname, name: user.name},
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      user: {
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        isContributor: user.isContributor,
        isViewOnly: user.isViewOnly,
        _id: user._id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllContactUsers = async (req, res) => {
  try {
    const users = await ContactUser.find({
      role: { $in: ['family', 'caregiver'] },
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export const deleteContactUser = async (req, res) => {
  try {
    const deleted = await ContactUser.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};

export const updateContactUser = async (req, res) => {
  try {
    const updated = await ContactUser.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('fullname email role isContributor isViewOnly _id');

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return complete user data
    res.json({
      _id: updated._id,
      id: updated._id,
      fullname: updated.fullname,
      email: updated.email,
      role: updated.role,
      isContributor: updated.isContributor,
      isViewOnly: updated.isViewOnly
    });
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};
