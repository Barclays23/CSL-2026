import rateLimit from "express-rate-limit";
export const loginLimiter=rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:"draft-8",legacyHeaders:false,message:{success:false,message:"Too many login attempts. Try again later.",errorCode:"LOGIN_RATE_LIMIT"}});
export const uploadLimiter=rateLimit({windowMs:60*60*1000,limit:50,standardHeaders:"draft-8",legacyHeaders:false});
