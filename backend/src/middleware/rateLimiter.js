import rateLimit from "express-rate-limit";


export const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 100,                 
  message: { message: "Too many requests from this IP, please try again later." },
  standardHeaders: true, 
  legacyHeaders: false,  
});


export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 5,                   
  message: { message: "Too many login/signup attempts, please try again later." },
});
