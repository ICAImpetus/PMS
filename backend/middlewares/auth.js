import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {

    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Authorization denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, `${process.env.keyForToken}`);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Error in auth middleware:', error);
        res.status(401).json({ message: 'Authorization denied. Invalid token.' });
    }
};

const normalizeRole = (role) => {
    if (role == null) return '';
    return String(role).trim().toLowerCase();
};

/**
 * Middleware to restrict access to specific roles
 * @param  {...string} roles - Allowed roles
 */
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        const rawUserRole = req.user?.userType || req.user?.type;
        const userRole = normalizeRole(rawUserRole);
        const allowedRoles = (roles || []).map(normalizeRole);
        if (!req.user || !allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: `Access denied. Role '${rawUserRole}' is not authorized for this action.`,
                success: false
            });
        }
        next();
    };
};

/**
 * Middleware to prevent 'admin' from performing DELETE operations
 */
export const preventAdminDelete = (req, res, next) => {
    const userRole = normalizeRole(req.user?.userType || req.user?.type);
    if (userRole === 'admin' && req.method === 'DELETE' && !req.user?.canDelete) {
        return res.status(403).json({
            message: "Delete access restricted for Admin role.",
            success: false
        });
    }
    next();
};

export default auth;
