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
import userRouter from './routes/user.routes.js'
import commentRouter from './routes/comment.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'
import likeRouter from './routes/like.routes.js'
import healthcheckRouter from './routes/healthcheck.router.js'
import playlistRouter from './routes/playlist.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import videoRouter from './routes/video.routes.js'

// routes declaration
app.use("/api/v1/users",userRouter) // this middleware pass control to userRouter
app.use("/api/v1/comments",commentRouter)
app.use("/api/v1/dashboard",dashboardRouter)
app.use("/api/v1/likes",likeRouter)
app.use("/api/v1/heathcheck",healthcheckRouter)
app.use("/api/v1/playlist",playlistRouter)
app.use("/api/v1/subscriptions",subscriptionRouter)
app.use("/api/v1/tweets",tweetRouter)
app.use("/api/v1/videos",videoRouter)


export  {app}