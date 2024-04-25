import mongoose,{isValidObjectId} from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike=asyncHandler(async(req,res)=>{
    const {videoId}=req.params

    if(!videoId.trim() || !isValidObjectId(videoId)){
        throw new ApiError(400,"Video id is required or invalid")
    }

    const video=await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400,"Video is not found")
    }

    const isAllreadyLiked=await Like.find({
        video:videoId,
        likedBy: req.user?._id
    })

    if (isAllreadyLiked.length==0) {
        const liked=await Like.create({
            video:videoId,
            likedBy:req.user?._id
        })

        return res
                    .status(200)
                    .json(
                        new ApiResponse(
                            200,
                            {},
                            "liked video"
                        )
                    )
    } else {
         const disliked=await Like.findByIdAndDelete(isAllreadyLiked,{new:true})

         return res 
                    .status(200)
                    .json(
                        new ApiResponse(
                            200,
                            {},
                            "removed liked from video"
                        )
                    )
    }
})

const toggleCommentLike=asyncHandler(async(req,res)=>{
    const {commentId}=req.params

    if (!commentId.trim()||!isValidObjectId(commentId)) {
        throw new ApiError(400,"commentid is required or invalid ")   
    }

    const comment=await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(400,"Comment not found")
    }
     
    const isAllreadyLiked=await Like.find({
        comment:commentId,
        likedBy:req.user?._id
    })

    if (isAllreadyLiked.length==0) {
        const liked=await Like.create({
            comment:commentId,
            likedBy:req.user?._id
        })

        return res
                    .status(200)
                    .json(
                        new ApiResponse(
                            200,
                            {},
                            "liked comment"
                        )
                    )
    } else {
         const disliked=await Like.findByIdAndDelete(isAllreadyLiked,{new:true})

         return res 
                    .status(200)
                    .json(
                        new ApiResponse(
                            200,
                            {},
                            "removed liked from comment"
                        )
                    )
    }
})

const toggleTweetLike=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params

    if (!tweetId.trim() || !isValidObjectId(tweetId)) {
       throw new ApiError(400,"tweetid is required and invalid") 
    }

    const tweet=await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(400,"tweet not found")
    }

    const isAllreadyLiked= await Like.find(
        {
            tweet:tweetId,
            likedBy:req.user?._id
        }
    )

    if (isAllreadyLiked.length==0) {
        const liked=await Like.create({
            tweet:tweet,
            likedBy:req.user?._id
        })

        return res
                    .status(200)
                    .json(
                        new ApiResponse(
                            200,
                            {},
                            "liked tweet"
                        )
                    )
    } else {
         const disliked=await Like.findByIdAndDelete(isAllreadyLiked,{new:true})

         return res 
                    .status(200)
                    .json(
                        new ApiResponse(
                            200,
                            {},
                            "removed liked from tweet"
                        )
                    )
    }

})

const getLikedVideos=asyncHandler(async(req,res)=>{

    const likedvideos=await Like.aggregate([
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"likedvedios"
            }
        },
        {
            $unwind:"$likedvideos"
        },{
            $project:{
                likedvideos:1
            }
        }

    ])

    if (!likedvideos) {
        
        return res.json(
            new ApiResponse(
                200,
                "user don't have liked videos"
            )
        )
    }

    return res .status(200)
                .json(
                    new ApiResponse(
                        200,likedvideos,
                        "liked videos fetched successfully"
                    )
                )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}