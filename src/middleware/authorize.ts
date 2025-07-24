import { Request, Response, NextFunction } from 'express';


export const authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ status: false, message: 'Access denied: User role not found' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ status: false, message: 'Access denied: Insufficient permissions' });
        }
        next();
    };
};