import mongoose,{isValidObjectId} from "mongoose";
import {Playlist} from "../models/playlist.model.js"
import { User } from "../models/user.model.js";
import {Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createPlaylist=asyncHandler(async(req,res)=>{
    const{name,description}=req.body

    if(!(name||description)){
        throw new ApiError ( 400,"name or description are required to create playlist")
    }

    const playlist= await Playlist.create({
        name:name,
        description:description || "",
        owner:req.user?._id,
        videos:[]
    })

    if(!playlist){
        throw new ApiError(500,"Error while playlist creation")
    }

    return res 
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        playlist,
                        "playlist created successfully"
                    )
                )
})

const getUserPlaylists= asyncHandler(async(req,res)=>{
    const {userId}=req.params

    if(!userId.trim() || !isValidObjectId(userId)){
        throw new ApiError(400,"user id required or inavalid")
    }

    const user= await User.findById(userId)

    if (!user){
        throw new ApiError(400,"user does not exist")
    }

    const playlist= await Playlist.find(
        {
            owner:new mongoose.Types.ObjectId(userId)
        }
    )

    if (!playlist) {
        throw new ApiError(400," playlist not found ")
    }

    const userPlaylist=await Playlist.aggregate([
        {
           $match:{
            owner: new mongoose.Types.ObjectId(userId)
           } 
        },{
             
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"playlistvideo",
                pipeline:[
                    {
                        $project:{
                            thumbanail:1,
                            videoFile:1,
                            title:1,
                            description:1,
                            views:1,
                        }
                    }
                ]
            }
        },{
            $project:{
                name:1,
                description:1,
                playlistvideo:1,
            }
        },{
            $sort:{
                createdAt:-1,
            }
        }
    ])

    if(userPlaylist.length==0){
        throw new ApiError(404,"playlist not exist ")
    }


    return res 
                .status(200)
                .json( 
                    new ApiResponse(
                        200,
                        userPlaylist,
                        " playlist fetched successfully"
                    )
                )
})

const getPlaylistById=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params

    if (!playlistId) {
        throw new ApiError(400," playlist id is required")
    }

    const playlist=await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400,"playlist not found ")
    }

    return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        playlist,
                        "playlist fond successfully"
                    )
                )
})

const addVideoToPlaylist=asyncHandler(async(req,res)=>{
    const {playlistId,videoId}=req.params

    if (!(playlistId && videoId)) {
        throw new ApiError(400," playlist id  and video id are required")
    }

    const video= await Video.findById(videoId)

    if (!video) {
         throw new ApiError(404,"video not found")
    }

    const playlist= await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400,"Playlist not found")
    }

    if(playlist.owner.toString()!= (req.user?._id).toString()){
        throw new ApiError(400,"Unauthorised user")
    }

    if(playlist.videos.includes(new mongoose.Types.ObjectId(videoId))){
        throw new ApiError(505,"Video is already exist in Playlist")
    }

    const addVideoToPlaylist= await Playlist.findByIdAndUpdate(
        playlistId,{
            $push:{videos:new mongoose.Types.ObjectId(videoId)}
        },{
            new :true
        }
    )

    return res 
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        addVideoToPlaylist,
                        "Successfully added the video in playlist"
                    )
                )
})

const removeVideoFromPlaylist=asyncHandler(async(req,res)=>{
    const {playlistId,videoId}=req.params

    if (!(playlistId && videoId)) {
        throw new ApiError(400,"Playlist id and Video id are required")
    }

    const video= await Video.findById(videoId)

    if (!video) {
        throw new ApiError (400,"video is not fond ")
    }

    const playlist=await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400,"Playlist is not found")
    }

    if(playlist.owner.toString()!= (req.user?._id).toString()){
        throw new ApiError(400,"Unauthorised user")
    }

    if (!playlist.videos.includes(new mongoose.Types.ObjectId(videoId))) {
        throw new ApiError(400,"video is not fond in the playlist")
    }

    const removeFromPlaylist= await Playlist.findByIdAndUpdate(
        playlistId,{
            $pull:{
                videos:new mongoose.Types.ObjectId(videoId)
            }
        },{
            new:true
        }
    )

    return res 
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        removeFromPlaylist,
                        "successfully remove video from playlist"
                    )
                )
})

const deletePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params

    if (!playlistId) {
        throw new ApiError(400,"playlist id is required")
    }

    const playlist=await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400,"playlist not found")
    }

    if(playlist.owner.toString() != (req.user?._id).toString()){
        throw new ApiError(400,"unauthorised user")
    }

    const deletedPlaylist=await Playlist.findByIdAndDelete(playlistId)

    if (!deletedPlaylist) {
        throw new ApiError(400,"error while deleting playlist")
    }

    return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        {},
                        "playlist successfully deleted"
                    )
                )
})

const updatePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params
    const {name,description}=req.body

    if(!playlistId.trim()){
        throw new ApiError(400,"playlist id is required")
    }

    if(!(name || description)){
        throw new ApiError (400,"name or description required")
    }

    const playlist=await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400,"playlist not found")
    }

    if (playlist.owner.toString()!=(req.user?._id).toString()) {
        throw new ApiError(400,"unauthorised user")
    }

    const updatedPlaylist=await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set:{
                name,
                description
            }
        },{
            new:true
        }
    )

    if (!updatedPlaylist) {
        throw new ApiError(500,"error while updating playlist")
    }

    return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        updatedPlaylist,
                        "successfully updated the playlist"
                    )
                )
})

export{
    createPlaylist,
    getPlaylistById,
    getUserPlaylists,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}