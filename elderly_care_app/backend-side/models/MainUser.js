import mongoose from "mongoose";

const MainUserSchema = new mongoose.Schema({
    fullname: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        unique: true, 
        required: true 
    }, 
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        default: 'admin' 
    },

}, { 
    timestamps: true 
});

const MainUser = mongoose.model('MainUser', MainUserSchema);

export default MainUser;
