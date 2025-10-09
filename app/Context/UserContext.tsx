"use client";

import React, { createContext, useState, useContext, useEffect } from "react";

type UserContextType = {
  profilePic: string;
  setProfilePic: (url: string) => void;
  name: string;
  setName: (name: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [profilePic, setProfilePicState] = useState("/profile.jpg");
  const [name, setName] = useState("Risha Sharma");

  // Load from localStorage
  useEffect(() => {
    const savedPic = localStorage.getItem("profilePic");
    const savedName = localStorage.getItem("userName");
    if (savedPic) setProfilePicState(savedPic);
    if (savedName) setName(savedName);
  }, []);

  const setProfilePic = (url: string) => {
    setProfilePicState(url);
    localStorage.setItem("profilePic", url);
  };

  const handleSetName = (newName: string) => {
    setName(newName);
    localStorage.setItem("userName", newName);
  };

  return (
    <UserContext.Provider value={{ profilePic, setProfilePic, name, setName: handleSetName }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
};
