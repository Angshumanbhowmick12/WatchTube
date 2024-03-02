import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"



const userSchema=new Schema({
      username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true  // index use for searcheble
      },
      email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
      },
      fullName:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        index:true
      },
      avatar:{
        type:String, //Cloudinary url
        required:true,
      },
      coverImage:{
        type:String, // cloudinary url
      },
      watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
      ],
      password:{
        type:String,
        required:[true, 'Password is required']
      },
      refreshToken:{
        type:String
      }
},
{
    timestamps:true
})

userSchema.pre("save", async function (next) { //pre is midleware is use for encrypt password in data base (it execute before update anything in database )

  // when we only change our password then its execute otherwise
  // every time we update something in database then every time password need to change 
 if(!this.isModified("password")) return next()
 this.password = await bcrypt.hash(this.password,10)
 next()
})

userSchema.methods.isPasswordCorret= async function(password){
  return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken= function() {
   return jwt.sign(
    {  // get data from databse to generate token
      _id:this._id,
      email:this.email,
      username:this.username,
      fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}
userSchema.methods.generateRefreshToken= function() {
  return jwt.sign(
    {  // get data from databse to refresh token
      _id:this._id
      
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}



export const User = mongoose.model("User",userSchema)