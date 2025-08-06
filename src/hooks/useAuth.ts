import React, { useState, useEffect, useContext } from 'react';
import { x25log } from '../utils/log';
import { AuthContext } from '../contexts/authContext';
import { navigate } from 'gatsby';

// Ping server routinely?

type UseAuthType = {
  isLoggedIn: boolean,
  demoLogin: () => void,
  logout: () => void 
}

export const useAuth = (): UseAuthType => {
  const context = useContext(AuthContext);

  if ( !context ){
    throw new Error("Attemping to access authContext, but it is not defined.")
  }

  const { user, login, logout } = context;

  const demoLogin = async () => {
    await login("demo", "demouser");
  }

  return {
    isLoggedIn: user !== undefined,
    demoLogin: demoLogin,
    logout
  }
}