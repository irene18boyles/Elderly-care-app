import axios from "axios"
import { useState } from "react"

import '../styles/SignUpForm.css'

export default function SignUpForm({setIsLogin}) {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        try {
            const response = await axios.post('http://localhost:8000/api/mainusers/register', {
                fullname: formData.fullname,
                email: formData.email,
                password: formData.password
            });
            console.log('Signup successful:', response.data);
            alert('Registration successful! Please log in.');
            setIsLogin(true);
        } catch (error) {
            console.error('Signup error:', error.response?.data || error.message);
            alert(error.response?.data?.message || 'An error occurred during registration');
        }
    };

    return (
        <div className="signupContainer flex flex-col justify-center border-2 border-white rounded-xl p-8 w-150 bg-blue-800/80 backdrop-blur-md shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center text-white">Sign Up</h2>
            <form onSubmit={handleSignup} className="space-y-4">
                <div>
                    <label htmlFor="fullname" className="block text-white mb-1">Full Name</label>
                    <input 
                        type="text" 
                        id="fullname"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Full Name"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-white mb-1">Email</label>
                    <input 
                        type="email" 
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Email"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-white mb-1">Password</label>
                    <input 
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Password"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="block text-white mb-1">Confirm Password</label>
                    <input 
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Confirm Password"
                        required
                    />
                </div>
                <div className="mb-4 text-sm text-white text-center">
                    Already have an account?{' '}
                    <span 
                        onClick={() => setIsLogin(true)}
                        className="text-blue-300 underline cursor-pointer hover:text-blue-200"
                    >
                        Login
                    </span>
                </div>
                <button 
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded cursor-pointer"
                >
                    SIGN UP
                </button>
            </form>
        </div>
    );
}