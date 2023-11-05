const mongoose = require('mongoose');
const joinSchema = new mongoose.Schema({
    catergory:{
        type:String,
        required: true,
    },
   
    name:{
        type:String,
        required: true,
    },
    description:{
        type:String,
        required: true,
    },
    organizer:{
        type:String,
        required: true,
    },
    eventdate:{
        type:String,
        required: true,
    },
    venue:{
        type:String,
        required: true,
    },
    time:{
        type:String,
        required: true,
    },
   
    join:{
        type:Number,
        required: true,
        default: 1,
    },
    
    
    joinDate:{
        type: Date,
        required: true,
        default: Date.now,
    },
});
module.exports = mongoose.model('Join',joinSchema);