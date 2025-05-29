import NotesFeed from "../models/NotesFeed.js";


//////////////////
// fetch all notes
//////////////////

const getAllNotesFeed = async (req, res) => {
    try {
        const notes = await NotesFeed.find()
            .populate('created_by', 'fullname email')
            .sort({ date: -1 });
        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({
            message: "Error Fetching notes",
            error: error.message
        });
    }
}


///////////////////////////////////////////////////////////////////////
// fetch user notes // If you want *only* the notes this user created:
///////////////////////////////////////////////////////////////////////

const getUserNotesFeed = async (req, res) => {
    try {
        const userId = req.user.id; // id from token
        const userRole = req.user.role;

        let notes;
        // Admin, family, and caregiver can see all notes
        if (userRole === 'admin' || userRole === 'family' || userRole === 'caregiver') {
            notes = await NotesFeed.find()
                .populate('created_by', 'fullname email')
                .sort({ date: -1 });
        } else {
            // Other users can only see their own notes
            notes = await NotesFeed.find({ created_by: userId })
                .populate('created_by', 'fullname email')
                .sort({ date: -1 });
        }

        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching notes", error: error.message });
    }
};
/////////////
//add notes 
////////////

const addNote = async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.id; // get user id from JWT token
        const userRole = req.user.role;

        // Only admin and contributors can add notes
        if (userRole !== 'admin' && userRole !== 'contributor') {
            return res.status(403).json({
                message: "You don't have permission to add notes",
                error: true
            });
        }

        const newNote = new NotesFeed({
            title,
            description,
            date: Date.now(),
            created_by: userId,
            creatorModel: 'MainUser' // Since we're using JWT auth, this will always be MainUser
        });

        const savedNote = await newNote.save();
        const populatedNote = await NotesFeed.findById(savedNote._id)
            .populate('created_by', 'fullname email');

        res.status(201).json({
            message: "Note added successfully",
            error: false,
            data: populatedNote
        });
    } catch (error) {
        res.status(500).json({
            message: "Error adding notes",
            error: error.message
        });
    }
}

const deleteNote = async (req, res) => {
    try {
        const note = await NotesFeed.findById(req.params.id);
        if (!note) return res.status(404).json({ message: "Note not found" });

        const userId = req.user.id;
        const userRole = req.user.role;

        // Only admin or the note creator can delete
        if (userRole !== 'admin' && note.created_by.toString() !== userId) {
            return res.status(403).json({ message: "You don't have permission to delete this note" });
        }

        await note.deleteOne();
        res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting note", error: error.message });
    }
};

const updateNote = async (req, res) => {
    try {
        const noteId = req.params.id;
        const { title, description } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        const note = await NotesFeed.findById(noteId);
        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        // Only admin or the note creator can update
        if (userRole !== 'admin' && note.created_by.toString() !== userId) {
            return res.status(403).json({ message: "You don't have permission to update this note" });
        }

        const updatedNote = await NotesFeed.findByIdAndUpdate(
            noteId,
            { title, description, date: Date.now() },
            { new: true }
        ).populate('created_by', 'fullname email');

        res.status(200).json({
            message: "Note updated successfully",
            error: false,
            data: updatedNote
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating note",
            error: error.message
        });
    }
}


export {addNote, deleteNote, updateNote, getAllNotesFeed, getUserNotesFeed} //