
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-full h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <img 
          src="https://sq360.com.br/logo-hubb-novo/hubb_pet_icon.png" 
          alt="HubbPet" 
          className="w-16 h-16 animate-pulse" 
        />
        <div className="text-lg font-medium text-muted-foreground">Carregando...</div>
      </div>
    </div>
  );
};

export default LoadingScreen;
