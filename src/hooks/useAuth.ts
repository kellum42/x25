import React, { useState, useEffect, useContext } from 'react';
import { x25log } from '../utils/log';
import { AuthContext, AuthContextType, AuthKey, Credentials, LoginStatus } from '../contexts/authContext';
// import { navigate } from 'gatsby';
import { User, x25Result } from '../utils/types';
import { login as strapiLogin } from "../utils/strapi";
import { navigate } from 'gatsby';
// import { User } from '../utils/types';
// import User

// Ping server routinely?


type UseAuthType = {
  user: User|undefined,
  demoLogin: () => Promise<x25Result<User>>,
  login: (username: string, password: string) => Promise<x25Result<User>>,
  // loadingUser: boolean,
  isLoggedIn: LoginStatus,
  jwt: string|null,
  handleTimeout: () => void
  // logout: () => void
}

const useAuth = (): UseAuthType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("Attemping to access authContext, but it is not defined.")
  }

  const { user, setUser, isLoggedIn } = context;

  const login = async (username: string, password: string): Promise<x25Result<User>> => {
    const result = await strapiLogin(username, password);
    if (result.status === "success") {
      x25log.d("[login][useAuth.ts]: %s successfully logged in.", username);

      if (typeof window !== 'undefined') {
        const jwt = result.data.jwt;
        // Store jwt in local storage.
        window.localStorage.setItem(AuthKey, JSON.stringify({ jwt, user: result.data.user }));
        setUser(result.data.user);
        return { status: "success", data: result.data.user };

      } else {
        x25log.e("[login][useAuth.ts]: Window is undefined.");
        return { status: "fail", error: "Logged in ok, but window is undefined." };
      }

    } else {
      x25log.d("[login][useAuth.ts]: Error logging in. Error - %s", result.error);
      return { status: "fail", error: result.error };
    }
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

  const demoLogin = async (): Promise<x25Result<User>> => {
    x25log.d("[demoLogin][useAuth.ts]: Attempting demo login.");
    return await login("demo", "demouser");

  }

  const getJWT = (): string|null => {
    try {
      const credentials = window.localStorage.getItem(AuthKey);
      const data: Credentials = JSON.parse(credentials ?? "");
      return data.jwt;

    } catch (error) {
      x25log.d("[getJWT][useAuth.ts]: Unable to get JWT.");
    }
    return null;
  }

  const handleTimeout = () => {
    x25log.i("[handleTimeout][useAuth.ts]: User session has timed out. Logging out.");
    window.localStorage.removeItem(AuthKey);
    setUser(undefined);
    
    navigate("/budgets/login");
  }

  return {
    user,
    demoLogin,
    login,
    // loadingUser: user === undefined,
    isLoggedIn,
    jwt: getJWT(),
    handleTimeout
  };
}

export default useAuth;