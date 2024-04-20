import mongoose,{isValidObjectId} from "mongoose";
import {User} from "../models/user.model.js"
import {Subscription} from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription=asyncHandler(async(req,res)=>{
    const {channelId}=req.params
    if (!channelId) {
        throw new ApiError(400,"channel id is required")
    }

    const user= await User.findById(channelId)

    if (!user) {
        throw new ApiError(400,"user does not exist")
    }

    const userExisted=await Subscription.find({
        subscriber:req.user?._id,
        channel:channelId
    })

    if(userExisted.length > 0){
        throw new ApiError (201,"you have already subscribed")
    }

    const subscriber = new mongoose.Types.ObjectId(req.user?._id)
    const channel = new mongoose.Types.ObjectId(channelId)

    const subscribed= await Subscription.create({
        subscriber: subscriber,
        channel : channel
    })

   if (!subscribed) {
    throw new ApiError(400,"there is a error when you are trying to subscribe to a channel")
   } 

   await User.findByIdAndUpdate(
    channelId,{
        $push:{
            subscriber: subscriber
        }
   },{
    new:true
   })

   await User.findByIdAndUpdate(
    req.user?._id,{
        $push:{
            subscribeTo:channel
        }
    },{
        new :true
    }
   )

   return res 
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        subscribed,
                        "succesfully subscribed channel"
                    )
                )
})

const unsubscribeChannnel= asyncHandler(async(req,res)=>{
    const {channelId}=req.params

    const registerUser= await User.findById(channelId)

    if (!registerUser) {
        throw new ApiError(400,"the channel which you are trying to acces for unsubscribe does not ex")
    }

    const unsubscribe= await Subscription.findByIdAndDelete({
        channel:registerUser._id,
        subscriber:req.user?._id
    })

    if (!unsubscribe) {
        throw new ApiError(400,"Unsubscribe failed")
    }

    await User.findByIdAndUpdate(channelId,{
        $pull:{
            subscriber:channelId
        }
    },{
        new:true
    })

    await User.findByIdAndUpdate(
        req.user?._id,{
            $pull:{
                subscribeTo:registerUser._id
            }
        },
        {
            new:true
        }
    )

    return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        unsubscribe,
                        "Succesfully Unsubscribed channel"

                    )
                )
})

const getUserChannelSubscribers=asyncHandler(async(req,res)=>{
    const {channelId}=req.params

    if (!channelId.trim()) {
        throw new ApiError(400,"channel id is required")
    }

    const channel=await User.findById(channelId)

    if (!channel) {
        throw new ApiError(400,"channel not found ")
    }

    const subscriber=await Subscription.aggregate([
        {
            $match:{
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from:"user",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscribers",
                pipeline:[
                    {
                        $project:{
                            fullname:1,
                            username:1,
                            avatar:1,
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                subscriber:{
                    $first:"$subscribers"
                }
            }
        },{
            $project:{
                subscribers:1
            }
        }
    ])

    if (subscriber.length == 0) {
        throw new ApiError(404,"No Subscriber found ")
    }

    return res 
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        subscriber,
                        "get all the subscriber successfully "
                    ))
})

const getSubscribedChnnels=asyncHandler(async(req,res)=>{
    const {channelId}=req.params

    if (!channelId.trim()) {
        throw new ApiError(400,"channel Id is required")
    }

    const channel=await User.findById(channelId)

    if (!channel) {
        throw new ApiError(404,"User not found ")
    }

    const subscribedChannel= await Subscription.aggregate([
        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(channelId)
            }
        },{
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"subscribedTo",
                pipeline:[
                    {
                        $project:{
                            fullname:1,
                            username:1,
                            avatar:1,
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                subscribeTo:{
                    $first:"$subscribedTo"
                }
            }
        },{
            $project:{
                subscribeTo:1,
            }
        },{
            $replaceRoot:{
                newRoot:"$subscribeTo"
            }
        }

    ])

})

export{
    toggleSubscription,
    unsubscribeChannnel,
    getUserChannelSubscribers,
    getSubscribedChnnels
}