// import axios from "axios";

// const API_LOGIN_URL = import.meta.env.VITE_LOGIN_URL;
// const API_REGISTER_URL = import.meta.env.VITE_REGISTER_URL;

// export const loginUser = async (email, password) => {
//     try{
//         const response = await axios.post(`${API_LOGIN_URL}`, {email, password});
//         return response.data;
//     } catch (error) {
//         console.error('Login error:', error.response?.data || error.message);
//         throw error;
//     }

// };

// export const registerUser = async (fullname, email, password, role) => {
//     try{
//         const response = await axios.post(`${API_REGISTER_URL}`, {
//             fullname,
//             email,
//             password,
//             role,
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Signup error:', error.response?.data || error.message)
//         throw error;
//     }
// }