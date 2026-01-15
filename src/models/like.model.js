import mongoose, {Schema} from "mongoose";

const likeSchema=new Schema({
    video:{
        type:String.Types.ObjectId,
        ref:"Video"
    },
    comment:{
        type:String.Types.ObjectId,
        ref:"Comment"
    },
    tweet:{
        type:String.Types.ObjectId,
        ref:"Tweet"
    },
    likedBy:{
        type:String.Types.ObjectId,
        ref:"User"
    },
},{timestamps:true})

export const Like=mongoose.model("Like",likeSchema)