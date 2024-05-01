import mongoose from "mongoose";
import {Comment} from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";


const getVideoComments=asyncHandler(async(req,res)=>{
    const {videoId}=req.params
    const {page=1,limit=10}=req.query

    if (!videoId) {
        throw new ApiError(400,"video id is required")
    }

    const video= await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400,"video is not found")
    }

    const comment=await Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner"
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"comment",
                as:"likedBy"
            }
        },
        {
            $skip:(page-1)*limit
        },
        {
            $limit:limit
        }
    ])

    if (!comment || !comment.length > 0) {
        throw new ApiError(400,"error while finding comments")
    }

    return res 
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        comment,
                        "get all the comments"
                    )
                )
})

const addComment=asyncHandler(async(req,res)=>{
        const {videoId}=req.params
        const {commentData}=req.body

        if(!videoId){
            throw new ApiError(400,"video id is required ")
        }

        const video=await Video.findById(videoId)

        if (!video) {
            throw new ApiError(400,"video is not found")
        }

        if (!commentData) {
            throw new ApiError(400,"comment is required for commenting on video")
        }
        
        const comment=await Comment.create({
            content:commentData,
            video:videoId,
            owner:req.user?._id
        })

        if(!comment){
            throw new ApiError(400,"error while creating comment")
        }

        return res 
                    .status(200)
                    .json(
                        new ApiResponse(
                            200,
                            comment,
                            "sucessfully comment on video"
                        )
                    )
})


const updateComment=asyncHandler(async(req,res)=>{
     const {commentId}=req.params
     const {newComment}= req.body

     if (!commentId) {
        throw new ApiError(400,"comment id is required")
     }

     if (!newComment) {
        throw new ApiError(400,"New comment is required for updating comment")
     }

     const comment=await Comment.findById(commentId)

     if (!comment) {
        throw new ApiError(400,"comment is not found")
     }

     if(comment.owner.toString()!=(req.user?._id).toString()){
        throw new ApiError(400,"unauthorized user")
     }

     const updatedComment=await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content:newComment
            }
        },{
            new:true
        }
     )

     if (!updatedComment) {
        throw new ApiError(400,"error while updating the comment")
     }

     return res 
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        updatedComment,
                        "sucessfully update the comment"
                    )
                )
})

const deleteComment=asyncHandler(async(req,res)=>{
        const {commentId}=req.params

        if (!commentId) {
            throw new ApiError(400,"comment id is required")
         }
    
        const comment=await Comment.findById(commentId)
    
         if (!comment) {
            throw new ApiError(400,"comment is not found")
         }
    
         if(comment.owner.toString()!=(req.user?._id).toString()){
            throw new ApiError(400,"unauthorized user")
         }

         const deletedComment=await Comment.findOneAndDelete(commentId)
    

         if (!deletedComment) {
            throw new ApiError(400,"error while deleting the comment")
        }

        return res
                    .status(200)
                    .json(
                        new ApiResponse(
                            200,
                            {},
                            "comment successfully deleted"
                        )
                    )
       
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}