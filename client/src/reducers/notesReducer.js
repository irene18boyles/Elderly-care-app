export const initialState = {
    noteData: {
        title: "",
        description: "",
        date: Date.now(),
    },
    notes: [], // storing all notes
    showModal: false, // for showing and hiding of modal
    isEdit: false, // for rdit and add mode
    currentNote: {_id: "", title: "", description: ""}, // for storing current notw
}

export function notesReducer(state, action) {
    switch (action.type) {
        case 'ADD_NOTE':
            return {
                ...state,
                notes: [...state.notes, action.data] //adding new note to the notes array               
            }
            case 'UPDATE_NOTE':
                return {
                    ...state,
                    notes: state.notes.map(note => note._id === action.data._id ? action.data : note)
                }
            case 'SET_MODAL_VISIBILITY':
                return {
                    ...state, 
                    showModal: action.payload
                }
            case 'SET_IS_EDIT': 
                return {
                    ...state,
                    isEdit: action.payload
                }
            case 'SET_CURRENT_NOTE':
                return {
                    ...state,
                    currentNote: action.payload
                }
            case 'LOAD_NOTES':
                return {
                    ...state,
                    notes: action.data || [] // loading all notes from the database
                }
            case 'CLEAR_NOTES':
                return {
                    ...state,
                    notes: []
                }
            case 'DELETE_NOTE':
                return {
                    ...state,
                    notes: state.notes.filter(note => note._id !== action.payload)
                }
            default:
                return state
    }
}