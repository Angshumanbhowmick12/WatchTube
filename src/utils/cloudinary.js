import { v2 as cloudinary } from "cloudinary";
import fs from "fs" 


          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary= async (localFilePath)=>{
   try {
     if(!localFilePath) return null
     //upload the file in cloudinary
    const response = await cloudinary.uploader.upload(localFilePath,{
         resource_type: "auto"
     })
     // file has been uploaded successfull
    // console.log("file is uploaded on cloudinary",response.url);
     fs.unlinkSync(localFilePath) // after upload on cloudinary its delete from local file 
     //return to user
     return response;
   } catch (error) {
     //when the file is not upload in cloudinary but this is on server it's need clear the file from server 
     fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
     return null;
   }
}

const deleteOnCloudinary=async(public_id)=>{
 try {
   if(!public_id){
     return null
   }
 
   const response=await cloudinary.uploader.destroy(public_id)
 
   return response
 } catch (error) {
      console.log(error)
 }
}

// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });

export {uploadOnCloudinary,deleteOnCloudinary}