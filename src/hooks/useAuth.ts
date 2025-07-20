import React, { useState, useEffect } from 'react';
import { login } from '../utils/strapi';
import { x25log } from '../utils/log';

export const useAuth = () => {
  const _key = "x25creds";

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const checkLoggedIn = () => {
    const creds = localStorage.getItem(_key);
    if (!creds){
      x25log.d("[checkLoggedIn][auth.ts]: No credentials exist.");
      return false;
    }

    // Ping server?
    return true;
  }

  const userLogin = () => {

  }

  const demoLogin = async () => {
    const result = await login("demo", "demouser");
    if (result.status === "success") {
      const jwt = result.data.jwt;
      // Store jwt in local storage.
      localStorage.setItem("x25creds", JSON.stringify({ jwt, user: result.data.user.username }));
      setIsLoggedIn(true);

    } else {
      x25log.d("[demoLogin][auth.ts]: Error logging in. Error - %s", result.error);
      console.log(result.error);
    }
  }

  const logout = () => {
    localStorage.removeItem(_key);
    setIsLoggedIn(false);
  }

  return {
    isLoggedIn,
    login: userLogin,
    demoLogin,
    logout,
  }
}