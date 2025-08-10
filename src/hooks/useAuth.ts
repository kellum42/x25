import React, { useState, useEffect, useContext } from 'react';
import { x25log } from '../utils/log';
import { AuthContext, AuthContextType, AuthKey } from '../contexts/authContext';
// import { navigate } from 'gatsby';
// import { User } from '../utils/types';
import { login as strapiLogin } from "../utils/strapi";

// Ping server routinely?

type UseAuthType = {
  // user: User | false | undefined,
  demoLogin: () => Promise<boolean>,
  loadingUser: boolean,
  isLoggedIn: boolean
  // logout: () => void
}

const useAuth = (): UseAuthType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("Attemping to access authContext, but it is not defined.")
  }

  const { user, setUser } = context;

  const login = async (username: string, password: string): Promise<boolean> => {
    const result = await strapiLogin(username, password);
    if (result.status === "success") {
      x25log.d("[login][useAuth.ts]: %s successfully logged in.", username);

      if (typeof window !== 'undefined') {
        const jwt = result.data.jwt;
        // Store jwt in local storage.
        window.localStorage.setItem(AuthKey, JSON.stringify({ jwt, user: result.data.user.username }));
        setUser(result.data.user);
        return true;

      } else {
        x25log.e("[login][useAuth.ts]: Window is undefined.");
      }

    } else {
      x25log.d("[login][useAuth.ts]: Error logging in. Error - %s", result.error);
      console.log(result.error);
    }
    return false;
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AuthKey);
      setUser(undefined);
    } else {
      // An error occurred.
      x25log.e("[logout][useAuth.ts]: Window is undefined.");
    }
  }

  const demoLogin = async (): Promise<boolean> => {
    x25log.d("[demoLogin][useAuth.ts]: Attempting demo login.");
    return await login("demo", "demouser");

  }

  return {
    demoLogin,
    loadingUser: user === undefined,
    isLoggedIn: user !== false
  };
}

export default useAuth;