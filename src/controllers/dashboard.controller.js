import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import {User} from "../models/user.model.js"
import {Tweet}from "../models/tweet.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";


const getChannelStats=asyncHandler(async(req,res)=>{
    const obj={}

    const videoDetails= await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"_id",
                foreignField:"owner",
                as:"totalvideos"
            }
        },
        {
            $addFields:{
                totalvideos:"$totalvideos"
            }
        },
        {
            $unwind:"$totalvideos"
        },
        {
            $group:{
                _id:"$_id",
                totalvideos:{
                    $sum:1
                },
                totalviews:{
                    $sum:"$totalvideos.views"
                }
            }
        },
        {
           $lookup:{
            from:"users",
            localField:"_id",
            foreignField:"_id",
            as:"totalsubscribers"
           } 
        },
        {
            $addFields:{
                totalsubscribers:{
                    $first:"$totalsubscribers"
                }
            }
        },
        {
            $project:{
                totalvideos:1,
                totalviews:1,
                totalsubscribers:{
                    $size:"$totalsubscribers.subscriber"
                }
            }
        }
    ])

    if(!videoDetails){
        obj["videoDetails"]=0
    }

    const likesDetailsofVideos=await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"totalvideolikes"
            }
        },
        {
           $unwind:"$totalvediolikes"  
        },
        {
            $group:{
                _id:"$totalvideolikes._id"
            }
        },
        {
            $count:"totallike"
        }
    ])

    if (!likesDetailsofVideos) {
        obj["videoDetails"]=0
    }

    const likesDetailsofComment=await Comment.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"comment",
                as:"totalcommentlikes"
            }
        },
        {
            $unwind:"$totalcommentlikes"
        },
        {
            $group:{
                _id:"$totalcommentlikes._id"
            }
        },
        {
            $count:"totallike"
        }
    ])

    if(!likesDetailsofComment){
        obj["videoDetails"]=0
    }

    const likesDetailsoftweets=await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"tweet",
                as:"totaltweetlikes"
            }
        },
        {
            $unwind:"$totaltweetlikes"
        },
        {
            $group:{
                _id:"totaltweetlikes._id"
            }
        },
        {
            $count:"totallike"
        }
    ])

    if(!likesDetailsoftweets){
        obj["videoDetails"]=0
    }

    obj["videoDetails"]=videoDetails,
    obj["videolikes"]= likesDetailsofVideos,
    obj["commentlikes"]=likesDetailsofComment,
    obj["tweetslikes"]=likesDetailsoftweets

    return res.json(
        new ApiResponse(
            200,
            obj,
            "all the details of this channel"
        )
    )
})

const getChannelVideo=asyncHandler(async(req,res)=>{
       let {page=1,limit=10,sortBy,sortType}=req.query
       
       page=isNaN(page) ? 1: Number(page)
       limit=isNaN(limit) ? 10 : Number(limit)

       if(page <= 0){
        page=1
       }
       if(limit<=10){
        limit = 10
       }

       const sortStage={}

       if(sortBy && sortType){
        sortStage["$sort"]={
            [sortBy] : sortType === "asc" ? 1: -1
        }
       }else{
        sortStage["$sort"]={
            createdAt:-1
        }
       }

       const videos=await Video.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        sortStage,
        {
            $project:{
                videoFile:1,
                thumbnail:1,
                views:1,
                duration:1,
                title:1
            }
        },
        {$skip:(page-1)*limit},
        {$limit:limit}
    ])


    return res 
               .status(200)
               .json(
                new ApiResponse(
                    200,
                    videos,
                    "get all videos of this channel"
                )
               )
})

export{
    getChannelStats,
    getChannelVideo
}