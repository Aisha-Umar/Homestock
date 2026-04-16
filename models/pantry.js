const mongoose = require('mongoose')

const pantrySchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    item:{
        type:String,
        required:true,
        trim:true
    },
    emoji: {
        type: String,
        default: "🛒"
    },
    quantity: {
        type:Number,
        default:1
    },
    store: {
        type: String,
        default: 'Unassigned'
    },
    weeksLasting:{
        type:Number
    },
    status: {
        type: String,
        enum: ['active', 'finished'],
        default: 'active'
    },
    finishedAt: {
        type: Date,
        default: null
    }
  }, {timestamps: true})

const Pantry = mongoose.model('Pantry',pantrySchema)
module.exports = Pantry