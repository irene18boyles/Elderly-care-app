export const initialState = {
    signUpData: {
        fullname: "",
        signupEmail: "",
        signupPassword: "",
        confirmPassword: "",
        role: "",
    }
}

export function authReducer(state, action) {
    switch(action.type){
        case 'SET_SIGNUP_FIELD':
            return{
                ...state,
                signUpData: {
                    ...state.signUpData,
                    [action.field]: action.value
                }
            }
            default:
                return state
    }
}