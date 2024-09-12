// src/context/GlobalStorage.js
import React, { createContext, useState } from 'react';

const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  // Global state for user name and level
  const [userName, setUserName] = useState(false);
  const [level, setLevel] = useState(1);

  // Update user name
  const updateUserName = (newName) => {
    setUserName(newName);
  };

  // Update level
  const updateLevel = (newLevel) => {
    setLevel(newLevel);
  };

  return (
    <GlobalContext.Provider value={{ userName, level, updateUserName, updateLevel }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;
