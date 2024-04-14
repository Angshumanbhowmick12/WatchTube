import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet=asyncHandler(async(req,res)=>{
    const {content}=req.body

    if (!content) {
        throw new ApiError(400,"content is required to tweet")   
    }

    const tweet=await Tweet.create({
       content,
       owner: req.user?._id
    })

    if (!tweet) {
        throw new ApiError(500,"Error while creating Tweet")
    }

    return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        tweet,
                        "Tweet created succesfully"
                    )
                )
})

const getUserTweets=asyncHandler(async(req,res)=>{
        const {userId}=req.params

        if (!userId.trim()|| !isValidObjectId(userId)) {
            throw new ApiError(400, "user id is required or invalid")
        }

        const user=await User.findById(userId)

        if (!user) {
            throw new ApiError(400,"user does not exist")
        }

        const tweets=await Tweet.aggregate([
            {
                $match: {
                    owner:new mongoose.Types.ObjectId(userId),
                }
            },
            {
                 '$lookup':{
                    'from':'users',
                    'localField':'owner',
                    'foreignField':'_id',
                    'as':'owner',
                    'pipeline':[{
                        '$project':{
                            'fullname':1,
                            'avatar':1,
                            "username":1,
                            "content":1
                        }
                    }]
                 }
            },
            {
                '$lookup':{
                    'from':'likes',
                    'localField':'_id',
                    'foreignField':'tweet',
                    'as':'likecount'
                }
            },{
                '$addFields':{
                    'likeCount':{
                        'size':'$likeCount'
                    }
                }
            },{
                '$addFields':{
                    'owner':{
                        'first':'$owner'
                    }
                }
            }
            
        ])

        if (!tweets) {
            throw new ApiResponse(400,"no tweets Available")
        }

    return res .status(200)
               .json(
                new ApiResponse(200,tweets,"tweets fetched successfully !")
               )

})

const updateTweet=asyncHandler(async(req,res)=>{
        const{tweetId}=req.params
        const{content}=req.body

        if (!tweetId) {
          throw new ApiError(400,"Tweet id is required ")   
        }

        if(!content){
            throw new ApiError(400,"Content is required")
        }

        const tweet= await Tweet.findById(tweetId)

        if (!tweet) {
            throw new ApiError(400,"tweet not found")
        }

        if((tweet.owner).toString()!=(req.user?._id).toString()){
            throw new ApiError(401,"invalid user")
        }

        const updatedTweet=await Tweet.findByIdAndUpdate(
            tweetId,{
                $set:{
                    content
                },
            },{
                new:true
            }
        )

        if(!updatedTweet){
            throw new ApiError(500,"error while updating tweet")
        }

        return res
                .status(200)
                .json(
                    new ApiResponse(200,updatedTweet,"Tweet updated successfully")
                )
})

const deleteTweet=asyncHandler(async(req,res)=>{
        const{tweetId}=req.params

        if (!tweetId.trim()) {
            throw new ApiError(400,"tweetid is required")
        }

        const tweet=await Tweet.findById(tweetId)

        if (!tweet) {
            throw new ApiError(400,"tweet not found ")
        }

        if((tweet.owner).toString()!= (req.user?._id).toString()){
            throw new ApiError(401,"invalid user")
        }

        const deletedTweet=await Tweet.findByIdAndDelete(tweetId)


        if (!deletedTweet) {
            throw new ApiError(400,"error while deleting tweet")
        }

        return res 
                .status(200)
                .json(
                    new ApiResponse(200,{},"tweet deletetd successfully")
                )
})

export{
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}