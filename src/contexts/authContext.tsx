import React, { ReactNode, useState, createContext, useEffect } from "react";
import { User } from "../utils/types";
import { x25log } from "../utils/log";
import { login as strapiLogin } from "../utils/strapi";

type AuthContextType = {
  user?: User,
  login: (username: string, password: string) => Promise<void>,
  logout: () => void,
}

type UserData = {
  jwt: string,
  user: User
}

enum CredentialStatus {
  Pending,
  Empty
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const _key = "x25creds";

  const [creds, setCreds] = useState<CredentialStatus|string>(CredentialStatus.Pending);
  const [user, setUser] = useState<User | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // let creds = null;
    if (creds === CredentialStatus.Pending ){
    // if (typeof window !== "undefined"){
      // const _creds = window.localStorage.getItem(_key);
    // }
      
      setCreds(localStorage.getItem(_key) ?? CredentialStatus.Empty);
    }
    // checkForLoggedInUser();

  }, []);

  useEffect(() => {
    if (creds !== CredentialStatus.Pending){
      checkForLoggedInUser();
  //     // setIsLoading(false);
    }
  }, [creds])

  const checkForLoggedInUser = () => {
    // if ( typeof window !== "undefined" ) {
      // const creds = window.localStorage.getItem(_key);
      if (typeof creds === "string") {
        x25log.d("[checkForLoggedInUser][authContext.tsx]: Credentials exist in local storage.");
        
        try {
          const data: UserData = JSON.parse(creds);
          setUser(data.user);

        } catch (error) {
          x25log.d("[checkForLoggedInUser][authContext.tsx]: Error parsing user data in local storage.");
        }
      } else if (creds === CredentialStatus.Empty ) {
        x25log.d("[checkForLoggedInUser][authContext.tsx]: No credentials exist.");
      } else {
        x25log.d("[checkForLoggedInUser][authContext.tsx]: Credential status outside of scope. This shouldn't occur.");
      }
      // return undefined;
    // } else {
    //   x25log.e("[checkForLoggedInUser][authContext.tsx]: Window object does not exist.");
    // }
    // setIsLoading(false);
  }

  const login = async (username: string, password: string) => {
    const result = await strapiLogin(username, password);
    if (result.status === "success") {
      if (typeof window !== 'undefined') {
        const jwt = result.data.jwt;
        // Store jwt in local storage.
        window.localStorage.setItem(_key, JSON.stringify({ jwt, user: result.data.user.username }));
        setUser(result.data.user);
      } else {
        x25log.e("[login][authContext.tsx]: Window is undefined.");
      }

    } else {
      x25log.d("[login][authContext.tsx]: Error logging in. Error - %s", result.error);
      console.log(result.error);
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(_key);
      setUser(undefined);
    } else {
      // An error occurred.
      x25log.e("[logout][authContext.tsx]: Window is undefined.");
    }
  }


  return (
    // isLoading ? 
      // <p>Loading...</p> :
      creds === CredentialStatus.Pending ?
        <p>Loading...</p> :
        <AuthContext.Provider value={{ user, login, logout }}>
          {children}
        </AuthContext.Provider>
  )
}

