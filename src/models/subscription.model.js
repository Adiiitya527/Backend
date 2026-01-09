import mongoose, {Schema} from "mongoose";

const subscriptionSchema=new Schema({
    subscriber:{
        type:Schema.Types.ObjectId,
        reference:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        reference:"User"
    }
},{timestamps:true})

export const Subscription=mongoose.model("Subsription",subscriptionSchema)