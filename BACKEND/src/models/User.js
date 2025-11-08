import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email :{
        type : String,
        required : true,
        unique : true
    },
    phone: { 
        type: String,
        required: false, // Make it optional, but recommended for notifications
        unique: true,
        sparse: true 
    },
    city : {
        type: String,
        required : function() {
            // only require city for privileged role
            return this.role === 'staff' || this.role === 'admin' ;
        }
    },
    password : {
        type : String,
        required : true
    },
    role : {
        type : String,
        enum : ['citizen', 'staff', 'admin'],
        default : 'citizen'
    },
    points : {
        type : Number,
        default : 0
    },
    resolutionStreak: {
        type : Number,
        default : 0 ,
        required : function() {
            return this.role === 'staff'
        }
    },
    topFixerBadge : {
        type : String,
        default : null ,
       
    },
    department : {
        type : String,
        enum: ['Sanitation', 'Structural', 'Plumbing', 'Electrical', null],
        required : function() {
            return this.role === 'staff'
        }
    },

},{timestamps : true});

export const User = mongoose.model('User', UserSchema)