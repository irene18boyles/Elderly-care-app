import mongoose, {Schema} from "mongoose"; 

const profilesettingsSchema = new Schema({
    // get uder id from token
userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MainUser', // came from the mongoose model name
    required: true,
    unique: true,
},
    contactNumber: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: null,
    },
    gender: {
        type: String,
        default: null,
        enum: ['Female', 'Male', 'Other']
    },
    dateOfBirth: {
        type: Date,
        default: null,
    }
}, { timestamps: true });

const ProfileSetting = mongoose.model('ProfileSetting', profilesettingsSchema)
export default ProfileSetting