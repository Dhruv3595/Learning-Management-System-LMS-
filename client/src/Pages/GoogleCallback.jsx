import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GoogleCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('Google Auth Error:', error);
      // Store error in localStorage and close popup
      localStorage.setItem('googleAuthResult', JSON.stringify({ error }));
      window.close();
      return;
    }

    if (code) {
      // Store the code in localStorage and close popup
      localStorage.setItem('googleAuthResult', JSON.stringify({ code }));
      window.close();
    } else {
      // No code received, close popup
      window.close();
    }
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing Google authentication...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;