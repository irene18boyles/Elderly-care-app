import mongoose, { Schema } from "mongoose"; // connection from api backend to database mongodb

const notesfeedSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    created_by: {  // tracks who created it
        type: mongoose.Schema.Types.ObjectId, 
        refPath: 'creatorModel', 
        required: true
    },
    creatorModel: {
        type: String,
        required: true,
        enum: ['MainUser', 'ContactUser'] // only these two types of users can create notes
    }
})

const NotesFeed = mongoose.model('NotesFeed', notesfeedSchema) // model name is NotesFeed

export default NotesFeed