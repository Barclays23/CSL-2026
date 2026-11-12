import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.config.js";
import { isDatabaseConnected } from "./config/database.config.js";
import { apiRouter } from "./routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";

const app=express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({origin:env.CLIENT_URL,credentials:true}));
app.use(express.json({limit:"1mb"}));
app.use(express.urlencoded({extended:true,limit:"1mb"}));
app.use(cookieParser());

app.get(`${env.API_PREFIX}/health`,(_req,res)=>{
  const connected=isDatabaseConnected();
  res.status(connected?200:503).json({success:connected,message:connected?"CSL API is running":"Database is not connected",data:{status:connected?"healthy":"unavailable",database:connected?"connected":"disconnected"}});
});
app.use(env.API_PREFIX,apiRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
export default app;
