import jwt from 'jsonwebtoken'

const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Authorization denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, `${process.env.keyForToken}`); // Replace 'your-secret-key' with your actual secret key
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error in auth middleware:', error);
        res.status(401).json({ message: 'Authorization denied. Invalid token.' });
    }
};

// module.exports = auth;

export default auth;
