import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from '../utils/asyncHandler.js'
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler( async(req,res)=>{
    const {page=1,limit=10,query,sortBy,sortType,userId}=req.query

    if(!userId){
        throw new ApiError(400,"userid not found")
    }

    const pipeline=[]

    if(userId){
        const user=await User.findById(userId)

        pipeline.push({
            $match:{
                owner: new mongoose.Types.ObjectId(user?._id)
            }
        })
    }

    if(query){
        pipeline.push({
            $match:{
                isPublished:false
            }
        })
    }

   let createField={}

   if(sortBy && sortType){
    createField[sortBy]= sortType === "asc" ? 1:-1

    pipeline.push({
        $sort:createField
    })
   }
   else{
     createField["createdAt"]=-1
     pipeline.push({
        $sort:createField
     })
   }
   pipeline.push({
    $skip:(page-1)*limit
   })
   pipeline.push({
    $limit:limit
   })

   const allVideos = await Video.aggregate(pipeline)

   if (!allVideos) {
     throw new ApiError(400,"pipeline aggregation problem")
   }

   res.status(200).json(
    new ApiResponse(200,allVideos,`get all videos count : ${allVideos.length}`)
   )
})

const publishAVideo=asyncHandler(async(req,res)=>{
    const {title,description}=req.body

    if(!title?.trim() || !description?.trim()){
        throw new ApiError(400,"Title and description are required ")
    }

    const thumbnailLocalpath=req.files?.thumbnail[0].path
    const videoLocalpath=req.files?.videoFile[0].path

    if (!thumbnailLocalpath) {
        throw new ApiError(400,"thumbnail file is required")
    }
    if (!videoLocalpath) {
        throw new ApiError(400,"video file is required")
    }

   const uploadThumbnail= await uploadOnCloudinary(thumbnailLocalpath)
   const uploadVideoFile = await uploadOnCloudinary(videoLocalpath)

   if (!uploadThumbnail && !uploadVideoFile) {
        throw new ApiError(500,"video and thumbnail are not upload on cloudinary")
   }

   const video= await Video.create({
        title:title,
        description,
        videoFile:uploadVideoFile.url,
        thumbnail:uploadThumbnail.url,
        duration:uploadVideoFile.duration,
        owner:new mongoose.Types.ObjectId(req.user?._id)
   })

   const newVideo= await Video.findById(video._id).select("-owner")

   if(!newVideo){
    throw new ApiError(500,"somthing went wrong when publishing video")
   }

   return res 
              .status(200)
              .json(
                new ApiResponse(
                    200,
                    newVideo, 
                    "video published successfully"
                ))
})

const getVideoById=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
})

const updateVideo=asyncHandler(async(req,res)=>{
    const{videoId}=req.params
})

const deleteVideo=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
})

const togglePublishstatus=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishstatus
}