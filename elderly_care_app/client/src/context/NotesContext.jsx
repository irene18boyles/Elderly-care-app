import axios from "axios"; // connection from frontend to backend
import { useEffect, createContext, useReducer, useCallback } from "react";
import { notesReducer, initialState } from "../reducers/notesReducer";
import { ACTION_TYPES } from "../action-types/actionTypes";

export const NotesContext = createContext()

export function NotesProvider({ children }) {
    const [state, dispatch] = useReducer(notesReducer, initialState) // galing notesReducer
    
    const capitalizeSentence = useCallback((text) => {
        return text
        .split('. ')
        .map(sentence => sentence.charAt(0).toUpperCase() + sentence.slice(1))
        .join('. ')
    }, []);

    const fetchAllNotes = useCallback(async () => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) return;
            
            const response = await axios.get('http://localhost:8000/api/notesfeed/allnotes', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            console.log("Fetched notes:", response.data);
            dispatch({
                type: ACTION_TYPES.LOAD_NOTES,
                data: response.data
            });
        } catch (error) {
            console.error("Error fetching notes from database", error);
        }
    }, []);

    const fetchUserNotes = useCallback(async () => {
        try {
            const token = localStorage.getItem('userToken');
            if (!token) return;
            
            const response = await axios.get('http://localhost:8000/api/notesfeed/allusernotes', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            console.log("Fetched notes:", response.data);
            if (response.data) {
                dispatch({
                    type: ACTION_TYPES.LOAD_NOTES,
                    data: response.data
                });
            }
        } catch (error) {
            console.error("Error fetching notes from database", error);
            // Clear notes on error to prevent showing stale data
            dispatch({
                type: ACTION_TYPES.CLEAR_NOTES
            });
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        const userRole = localStorage.getItem('userRole');
        if (token) {
            // Use fetchAllNotes for admin, fetchUserNotes for others
            if (userRole === 'admin') {
                fetchAllNotes();
            } else {
                fetchUserNotes();
            }
        }
    }, [fetchAllNotes, fetchUserNotes]);

// add notes to dbase
    const addNotesToDb = async (noteData) => {
        try {
            const token = localStorage.getItem('userToken') // gets the token from local storage
            const response = await axios.post('http://localhost:8000/api/notesfeed/addnote', noteData, {
                headers: {
                    Authorization:`Bearer ${token}`,
                }
            })
            dispatch({
                type: ACTION_TYPES.ADD_NOTE,
                data: response.data.data
            })
            console.log("added new note")

        } catch (error) {
            console.error("Error adding new note to the database", error)
        }
    }

    const deleteNotesToDb = async (noteId) => {
        try {
            const token = localStorage.getItem('userToken');
            await axios.delete(`http://localhost:8000/api/notesfeed/delete/${noteId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            dispatch({
                type: ACTION_TYPES.DELETE_NOTE,
                payload: noteId
            });
        } catch (error) {
            console.error("Error Deleting note from database", error);
            throw error;
        }
    };


    const updateNoteInDb = async (noteData) => {
        try {
            const token = localStorage.getItem('userToken');
            const response = await axios.put(
                `http://localhost:8000/api/notesfeed/update/${noteData._id}`, 
                noteData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            dispatch({
                type: ACTION_TYPES.UPDATE_NOTE,
                data: response.data.data
            });

            console.log("Updated note:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error updating note in the database", error);
            throw error;
        }
    };



    return (
        <NotesContext.Provider value={{
            state,
            dispatch,
            addNotesToDb,
            updateNoteInDb,
            deleteNotesToDb,
            fetchUserNotes,
            fetchAllNotes,
            capitalizeSentence

        }}>
            {children}
        </NotesContext.Provider>
    )
}