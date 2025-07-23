import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, // Each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

export const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 5, // Limit to 5 requests per hour for sensitive operations
    message: 'Too many requests for this operation, please try again after an hour',
});