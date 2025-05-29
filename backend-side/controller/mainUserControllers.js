import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import MainUser from '../models/MainUser.js';

import ProfileSetting from '../models/ProfileSettings.js'; // import schema
import PatientsDetail from '../models/PatientsDetails.js'; // import associated schema


///////////////////////////////////////
// When user registers, automatically 
// create a profile settings with their 
// information as "null"
//////////////////////////////////////
export const registerAdmin = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    const existing = await MainUser.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const newAdmin = new MainUser({
      fullname,
      email,
      password: hashed,
      role: 'admin',
    });

    await newAdmin.save(); // save main user to dbase first


//////////////////////////////////////////////////////////////
// This is where you would create the associated user profile
// (e.g., in a separate UserProfile model)
//////////////////////////////////////////////////////////////

     // then Create the associated user profile
    await ProfileSetting.create({
      userId: newAdmin._id,
      // fullname: newAdmin.fullname,
      // email: newAdmin.email
    });

    await PatientsDetail.create({
      patientId: newAdmin._id, // associate with the admin
    })

    res.status(201).json({ message: 'Admin registered' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await MainUser.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid email or password' });

/////////////////////////////////////////////////
// Generates JWT token for the user gets the "id"
/////////////////////////////////////////////////
    const token = jwt.sign({ id: user._id, role: user.role, fullname: user.fullname, userType: 'MainUser' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({
      token,
      user: { id: user._id, email: user.email, fullname: user.fullname, role: user.role  },
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};