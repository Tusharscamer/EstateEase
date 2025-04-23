const mongoose=require("mongoose")
const Schema =mongoose.Schema;
const Review=require("./review.js")
const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image: {
        url:String,
        filename:String,
    },
    
    price:Number,
    location:String,
    country:String,
    reviews: [
        {
           type: Schema.Types.ObjectId,
           ref:"Review",
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    propertyType:[
        {
            type:[String],
            required:true,
        }
    ],
    tokenPaid: {
        type: Boolean,
        default: false,  
    },
    tokenPaymentId: {     
        type: String,  
        default: null,
    },
    buyer: {
        type: Schema.Types.ObjectId,
        ref: "User",  
        default: null,
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending'
    },
    verificationNotes: {
        type: String,
        default: ''
    }
});
listingSchema.post("findOneAndDelete",async (listing)=>{
    if(listing){
    await Review.deleteMany({_id:{$in:listing.reviews}});
    }
})
const Listing = mongoose.model("Listing",listingSchema);
module.exports=Listing
