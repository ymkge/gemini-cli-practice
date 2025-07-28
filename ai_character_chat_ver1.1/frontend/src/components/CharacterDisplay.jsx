import React from 'react';

const CharacterDisplay = ({ currentEmotion, characterImages }) => {
  const imageSrc = characterImages[currentEmotion] || characterImages['neutral'];

  return (
    <div className="character-display">
      <img src={imageSrc} alt="AI Character" style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );
};

export default CharacterDisplay;
