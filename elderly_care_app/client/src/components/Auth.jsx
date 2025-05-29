import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import elderlyCareImage from '../img/Elderly Care.png';

const Auth = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const handleLoginSuccess = async (userData) => {
    // First store all user data in localStorage
    localStorage.setItem('userToken', userData.token);
    localStorage.setItem('userInfo', JSON.stringify(userData.user));
    localStorage.setItem('userRole', userData.user.role);
    
    // Set permissions based on user role and type
    if (userData.user.role === 'family' || userData.user.role === 'caregiver') {
      localStorage.setItem('isContributor', String(!!userData.user.isContributor));
      localStorage.setItem('isViewOnly', String(!userData.user.isContributor || !!userData.user.isViewOnly));
    } else if (userData.user.role === 'admin') {
      localStorage.setItem('isContributor', 'true');
      localStorage.setItem('isViewOnly', 'false');
    }
    
    // Call onLogin and wait for it to complete
    await onLogin();
    
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event('userLoggedIn'));
    
    // Use a small timeout to ensure state updates are processed
    setTimeout(() => {
      navigate('/home');
    }, 100);
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen font-sans">
      <div className="flex justify-center items-center max-w-2.5 w-full">
        <div className='flex flex-col items-center justify-center'>
          <img src={elderlyCareImage} alt="elderlycare" />
          {isLogin ? (
            <LoginForm 
              onLogin={handleLoginSuccess}
              setIsLogin={setIsLogin} 
            />
          ) : (
            <SignUpForm setIsLogin={setIsLogin} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
