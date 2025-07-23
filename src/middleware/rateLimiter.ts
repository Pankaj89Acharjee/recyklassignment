import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';


export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, // Each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
});


export const throttle = slowDown({
  windowMs: 15 * 60 * 1000, // 15 mins
  delayAfter: 20,           // After 20 requests
  delayMs: 500              // 0.5 sec delay per request
});