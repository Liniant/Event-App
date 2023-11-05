const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
    catergory:{
        type:String,
        required: true,
    },
    name:{
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
    description:{
        type:String,
        required: true,
    },
    time:{
        type:String,
        required: true,
    },
    image:{
        type:String,
        required: true,
    },
    active:{
        type:Number,
        required: true,
        default: 1,
    },
    createdby:{
        type:String,
        required: false,
    },
    editedby:{
        type:String,
        required: false,
    },
    created:{
        type: Date,
        required: true,
        default: Date.now,
    },
});
module.exports = mongoose.model('Event',eventSchema);