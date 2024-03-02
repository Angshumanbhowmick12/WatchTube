import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


// Database is on another continent 
const connectDB=async()=>{
    try {
        const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) // MongoDB connect to database
        console.log(`\n MongoDB Connected !! DB HOST: ${connectionInstance.connection.host}`); // which host i can connect with DB
    } catch (error) {
        console.log("MongoDB Connection Failed ", error)
        process.exit(1) // nodejs give aceess us for process, this is running current application process
                        //then we can exit the process
    }
}

export default connectDB