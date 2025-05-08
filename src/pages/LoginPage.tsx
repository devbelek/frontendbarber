// src/pages/LoginPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import * as jwtDecode from 'jwt-decode';
import { Scissors } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  const handleGoogleLoginSuccess = (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode.jwtDecode(credentialResponse.credential);
      console.log('Google login success:', decoded);

      // Extract relevant user info
      const userInfo = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        given_name: decoded.given_name,
        family_name: decoded.family_name
      };

      // Login with Google
      loginWithGoogle(userInfo);

      // Redirect to profile page
      navigate('/profile');

      // Show success message
      setTimeout(() => {
        alert('Вы успешно вошли как барбер через Google!');
      }, 500);
    } catch (error) {
      console.error('Error processing Google login:', error);
      alert('Произошла ошибка при входе через Google. Пожалуйста, попробуйте ещё раз.');
    }
  };

  const handleGoogleLoginError = () => {
    console.error('Google login failed');
    alert('Не удалось выполнить вход через Google. Пожалуйста, попробуйте ещё раз.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="flex items-center justify-center mb-8">
          <Scissors className="h-10 w-10 text-[#9A0F34] mr-3" />
          <h1 className="text-2xl font-bold">TARAK</h1>
        </div>

        <h2 className="text-xl font-bold text-center mb-6">Вход для барберов</h2>

        <p className="text-center text-gray-600 mb-6">
          Используйте свой аккаунт Google для входа в систему.
          После авторизации вы сможете создавать и управлять своими услугами.
        </p>

        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
            useOneTap
            theme="outline"
            shape="rectangular"
            logo_alignment="center"
            text="signin_with"
            locale="ru"
            width="300px"
          />
        </div>

        <p className="text-center text-sm text-gray-500">
          Мы используем данные вашего Google-аккаунта только для идентификации.
          Мы не получаем доступ к вашей почте или другим сервисам Google.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;