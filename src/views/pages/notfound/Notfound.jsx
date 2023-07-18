import React from 'react';
import { useNavigate } from 'react-router-dom';
import './notfound.scss';
import notFound from '../../../assets/images/404.jpg';

const Notfound = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/home');
  };

  return (
    <div className="containerNotfound">
      <div className="containerLeft">
        <img src={notFound} alt="" />
      </div>
      <div className="containerRight">
        <h2>Error 404: Page Not Found</h2>
        <h3>The page you&apos;re looking for doesn&apos;t exist.</h3>
        <button onClick={handleBackToHome}>Back To Home</button>
      </div>
    </div>
  );
};

export default Notfound;
