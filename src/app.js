import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app =express()

app.use(cors({
     origin: process.env.CORS_ORIGIN, // which origin you allow
     credentials:true
})) // use() method use for midleware or any configure

app.use(express.json({limit:"16kb"})) // configure json data 
app.use(urlencoded({extended:true,limit:"16kb"})) // get data from url and extended use for object within another object
app.use(express.static("public")) // static use for store the file in our public 
app.use(cookieParser()) //cookieParser use for accept and set cookies from browser


//routes import
import userRouter from './routes/user.route.js'

// routes declaration
app.use("/api/v1/users",userRouter) // this middleware pass control to userRouter

export  {app}