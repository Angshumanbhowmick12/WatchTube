import dotenv from "dotenv"
import connectDB from "./db/index.js"
import { app } from "./app.js"

dotenv.config({
    path:'./.env'
})


connectDB() // this is a Async methods its return a promise
.then(()=>{
        app.listen(process.env.PORT || 8000,()=>{
            console.log("Server is Running at port",process.env.PORT);
        })

        app.on("error",(error)=>{
            console.log("ERRR:",error);
            throw error
        })
})
.catch((err)=>{
    console.log("MongoDB connection FAILED !!!!!",err);
})