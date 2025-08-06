import "./src/styles/plugins.bundle.css"
import "./src/styles/style.bundle.css"
import React from 'react';
import { AuthProvider } from '../contexts/authContext'

export const wrapRootElement = ({ element }) => {
  return <AuthProvider>{element}</AuthProvider>;
};