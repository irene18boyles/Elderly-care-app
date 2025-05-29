import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;  //1. authorization header

  if (authHeader && authHeader.startsWith('Bearer ')) { // if header exists and starts with Bearer
    const token = authHeader.split(' ')[1]; //extract the token from the header
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // 2. verify the token using JWT_SECRET
      // console.log('Decoded token:', decoded);
      //if the token is valid, we can access the user information
      req.user = decoded; // 3. attach the decoded token to the req. object
      next(); // pas the request to the next middleware or route handler
    } catch (err) {
      return res.status(401).json({ message: 'Token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};
