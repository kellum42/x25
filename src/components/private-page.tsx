import { navigate, PageProps } from "gatsby"
import React from "react"
import { useAuth } from "../hooks/useAuth"

type PrivatePageProps = {
  path: string,
  children: React.ReactNode
}


const PrivatePage: React.FC<PrivatePageProps> = ({ path, children }) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn && path !== `/login`) {
    if (typeof window !== "undefined"){
      navigate("/login");
    }
    return null
  }

  return <>{children}</>
}

export default PrivatePage;