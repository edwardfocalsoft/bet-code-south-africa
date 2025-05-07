
import React, { createContext } from "react";
import { AuthContextType } from "./types";
import { useAuthProvider } from "./useAuthProvider";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const authProviderValue = useAuthProvider();
  
  return (
    <AuthContext.Provider value={authProviderValue}>
      {children}
    </AuthContext.Provider>
  );
};
