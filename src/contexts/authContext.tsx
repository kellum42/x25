import React, { ReactNode, useState, createContext, useEffect } from "react";
import { User } from "../utils/types";
import { x25log } from "../utils/log";
import { login as strapiLogin } from "../utils/strapi";


export enum LoginStatus { Pending = "Pending", No = "No", Yes = "Yes" }

export type AuthContextType = {
  user?: User,
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>,
  isLoggedIn: LoginStatus,
  // setIsLoggedIn: React.Dispatch<React.SetStateAction<LoginStatus>>
  // login: (username: string, password: string) => void,
  // logout: () => void,
  // demoLogin: () => void
}

export type Credentials = {
  jwt: string,
  user: User
}

export const AuthContext = createContext<AuthContextType>({
  user: undefined,
  setUser: () => {},
  isLoggedIn: LoginStatus.Pending,
  // setIsLoggedIn: () => {}
});

export const AuthKey = "x25creds";

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [user, setUser] = useState<User>();
  const [isLoggedIn, setIsLoggedIn] = useState<LoginStatus>(LoginStatus.Pending);

  useEffect(() => {
    // initial load of user from local storage.
    x25log.d("[useEffect][authContext.tsx]: AuthProvider instantiated. Loading user.");
    const credentials = window.localStorage.getItem(AuthKey);
    checkForLoggedInUser(credentials);
  }, []);

  useEffect(() => {
    x25log.d("[useEffect][authContext.tsx]: User %sset.", user ? "" : "not ");
    setIsLoggedIn( user ? LoginStatus.Yes : LoginStatus.No );

  }, [user])

  useEffect(() => {
    x25log.d("[useEffect][authContext.tsx]: User login status has changed. %s", isLoggedIn);
  }, [isLoggedIn])


  const checkForLoggedInUser = (creds: string | null) => {
    if (typeof creds === "string") {
      x25log.i("[checkForLoggedInUser][authContext.tsx]: Credentials exist in local storage.");

      try {
        const data: Credentials = JSON.parse(creds);
        setUser(data.user);
        // setIsLoggedIn(LoginStatus.Yes)
        return;

      } catch (error) {
        x25log.d("[checkForLoggedInUser][authContext.tsx]: Error parsing user data in local storage.");
      }
    }
    else {
      x25log.i("[checkForLoggedInUser][authContext.tsx]: No credentials exist.");
    }
    // setUser(false);
    setIsLoggedIn(LoginStatus.No)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  )
}

