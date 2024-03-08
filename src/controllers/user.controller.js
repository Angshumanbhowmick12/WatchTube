import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'

// we are generate access and refresh token in many time that why we are using a function

const generateAccessAndRefreshTokens= async (userId)=>{
   try {
     const user= await User.findById(userId)
     const accessToken=user.generateAccessToken()
     const refreshToken=user.generateRefreshToken()

     // we will give accessToken to user but the refresh toke need to save in our database 

     // add value in our user object 
       user.refreshToken=refreshToken
      await  user.save({validateBeforeSave: false}) // refreshToken save in our dataBase

       return {accessToken,refreshToken}

     
   } catch (error) {
       throw new ApiError(500,"Something went Worng while generating refresh and access token")
   }
}

const registerUser=asyncHandler(async(req,res)=>{
   // get user details from frontend 
   //validation- not empty
   // check if user already exists: username,email 
   // check for images, check for avatar
   //upload them to cloudinary,avatar
   // create user object-create entry in db
   // remove password and refresh token field from response
   // check for user creation
   //return res

   // get user details from frontend 
   const {fullName,username,email,password}=req.body

   //validation- not empty
   if (
        [fullName,email,username,password].some((field)=> field?.trim()=== "")
        // if filed?.trim() is true then one of the fileds are emnpty 
        //some function return true or false value for array elements
    ) {
           throw new ApiError(400,"All fields are required")
       }
    // check if user already exists: username,email, check from db 
     const existendUser= await User.findOne({
          $or: [{username},{email}]
       })
     if(existendUser){
        throw new ApiError(409,"User with email or username already exist")
     }

     // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    //console.log(req.files?.avatar);
    //const coverImageLocalPath= req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
    //console.log(req.files);

    if (!avatarLocalPath) {
       throw new ApiError(400,"Avatar files is required")
    }
   //  upload them to cloudinary,avatar and coverImage
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
      throw new ApiError(400,"Avatar file is required")
    }

   //  create user object-create entry in db
    const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username:username.toLowerCase()
    })
  
   // check user is created or not 
   // mongodb create a unique _id for every filed of data 
   const createUser = await User.findById(user._id).select(
      "-password -refreshToken" // remove password and refresh token field from response
   )
   
   if (!createUser) {
      throw new ApiError(500,"Something went Wrong while regisertering the user ")
   }

   //return response
   return res.status(201)
   .json(
      new ApiResponse(200,createUser,"User register successfully")
   )

})

const loginUser=asyncHandler(async (req,res)=>{
   // req body -> data 
   //username or email 
   //find the user 
   // password check 
   // access and refresh token generate 
   // send cookie 

   const { email, username , password}= req.body
   
   if (!username && !email) {
      throw new ApiError(400,"username or email is required")
   }

   const user= await User.findOne({
      $or:[{username},{email}]
   })

   if (!user) {
      throw new ApiError(404,"User is not exits ")
   }
   
   const isPasswordValid = await user.isPasswordCorret(password)

   if (!isPasswordValid) {
      throw new ApiError(401,"please enter a valid password")
   }

  const{accessToken,refreshToken} =await generateAccessAndRefreshTokens(user._id)

  const loggedInUser =await User.findById(user._id).select("-password -refreshToken")

  //when we want to send cookies to the user need to design some options with cookies 

const options={
   httpOnly:true,
   secure:true
}

return res
.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
.json(
   new ApiResponse(
      200,
      {
         user: loggedInUser,accessToken,refreshToken
      },
      "User logged in SuccessFully"
   )
)
})

const logOutUser=asyncHandler(async (req,res)=>{
   await User.findByIdAndUpdate(req.user._id,{
      $unset:{
         refreshToken:1 // this removes the field from document
      }
   },{
      new:true
   })

   const options={
      httpOnly:true,
      secure:true
   }

   return res
   .status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshtoken",options)
   .json( new ApiResponse(200,{},"User logged out"))

})

const refreshAccessToken=asyncHandler(async(req,res)=>{
   try {
      // we can get the refreshtoken from cookies and body 
     const incommingrefreshToken = req.cookie.refreshToken||req.body.refreshToken
   
     if(!incommingrefreshToken){
      throw new ApiError(401,"Unauthorized request from refresh token")
     }
       const decodedToken=jwt.verify(incommingrefreshToken,REFRESH_TOKEN_SECRET)
   
     const user = await User.findById(decodedToken?._id)
     if (!user) {
       throw new ApiError(401,"Invalid refresh token")
     }
     if(incommingrefreshToken !== user?.refreshToken){
       throw new ApiError(401,"Refresh token is expired and used")
     }
   
     const options={
      httpOnly : true,
      secure:true
     }
   
      const {accessToken,newRefreshToken}= await generateAccessAndRefreshTokens(user._id)
   
      return res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshtoken",newRefreshToken,options)
      .json(
         new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},"Access Token refreshed ")
      )
   } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token")
   }
})

const changeCurrentPasssword= asyncHandler(async(req,res)=>{

   //get oldpassword and new password from the user 
   //  first user login is verify by auth middleware then we get the user _id and find in the database
   // check user password is correct or not
   // if password is correct the change the password with newpassword
   // save password in database 
   // return newpassword with response 
   const {oldPassword,newPassword}=req.body

   const user=await User.findById(req.user?._id)

   const isPasswordCorret= await user.isPasswordCorret(oldPassword)

   if (!isPasswordCorret) {
       throw new ApiError(400,"Invalid Password")
   }

   user.password=newPassword
   await user.save({validateBeforeSave:false})

   return res
   .status(200)
   .json( new ApiResponse(200,{},"Password changed successfully"))


})

const getCurrentUser=asyncHandler(async(req,res)=>{
   return res
   .status(200)
   .json(new ApiResponse(200,req.user,"current user fetched sucessfully"))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body

    if (!fullName||!email) {
      throw new ApiError(400," All the fields are required") 
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{
            fullName,email:email
         }
      },
      {new:true}
      ).select("-password")

      return res
      .status(200)
      .json(
         new ApiResponse(200,user,"User details updated Successfully")
         )
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
   const avatarLocalPath=req.files?.path

   if (!avatarLocalPath) {
      throw new ApiError(400,"Avatar file is mising ")
   }

  const avatar= await uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) {
    throw new ApiError(400,"Error while uploading on avatar")
  }

 const user= await User.findByIdAndUpdate(
   req.user?._id,{
      $set:{
         avatar:avatar.url
      }
   },
   {new :true}
 ).select("-password")

 return res
 .status(200)
 .json(
   new ApiResponse(200,user,"Avatar image updated successfully")
 )
})

const updateUserCoverImge=asyncHandler(async(req,res)=>{
   const coverImageLocalPath=req.files?.path

   if(!coverImageLocalPath){
      throw new ApiError(400,"coverimage file is missing")
   }

  const coverImage= await uploadOnCloudinary(coverImageLocalPath)

  if(!coverImage.url){
    throw new ApiError(400,"Error while uploading coverimage ")
  }

  const user=await User.findByIdAndUpdate(
      req.user?._id,{
         $set:{
            coverImage:coverImage.url
         }
      },{
         new:true
      }
  ).select("-password")

  return res
  .status(200)
  .json(200,user,"Cover Image updated successfully ")
})

export {
   registerUser,
   loginUser,
   logOutUser,
   refreshAccessToken,
   changeCurrentPasssword,
   getCurrentUser,
   updateAccountDetails,
   updateUserAvatar,
   updateUserCoverImge
}