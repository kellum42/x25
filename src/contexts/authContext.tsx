import React, { ReactNode, useState, createContext, useEffect } from "react";
import { User } from "../utils/types";
import { x25log } from "../utils/log";
import { login as strapiLogin } from "../utils/strapi";

export type AuthContextType = {
  user?: User | false,
  setUser: React.Dispatch<React.SetStateAction<false | User | undefined>>
  // login: (username: string, password: string) => void,
  // logout: () => void,
  // demoLogin: () => void
}

type UserData = {
  jwt: string,
  user: User
}

export const AuthContext = createContext<AuthContextType>({
  user: undefined,
  setUser: () => { }
});

export const AuthKey = "x25creds";

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [user, setUser] = useState<User | undefined | false>();

  useEffect(() => {
    // initial load of user from local storage.
    x25log.d("[useEffect][authContext.tsx]: AuthProvider instantiated. Loading user.");
    const credentials = window.localStorage.getItem(AuthKey);
    checkForLoggedInUser(credentials);
  }, []);

  useEffect(() => {
    x25log.d("[useEffect][authContext.tsx]: User status has changed. %s", (user ?? "undefined").toString());
  }, [user])


  const checkForLoggedInUser = (creds: string | null) => {
    if (typeof creds === "string") {
      x25log.i("[checkForLoggedInUser][authContext.tsx]: Credentials exist in local storage.");

      try {
        const data: UserData = JSON.parse(creds);
        setUser(data.user);
        return;

      } catch (error) {
        x25log.d("[checkForLoggedInUser][authContext.tsx]: Error parsing user data in local storage.");
      }
    }
    else {
      x25log.i("[checkForLoggedInUser][authContext.tsx]: No credentials exist.");
    }
    setUser(false);
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

