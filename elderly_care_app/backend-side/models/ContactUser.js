import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    fullname: { 
        type: String
    },
    email: { 
        type: String, 
        unique: true
    },
    password: {
        type: String
    },
    role: { 
        type: String, 
        enum: ['family', 'caregiver'], 
        required: true
    },
    created_by: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'MainUser', 
        required: true},
    invitationToken: { 
        type: String
    },
    isActive: { 
        type: Boolean, 
        default: false
    },
    isContributor: {
        type: Boolean,
        default: false,
    },
    isViewOnly: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true});

const ContactUser = mongoose.model('ContactUser', contactSchema)

export default ContactUser;