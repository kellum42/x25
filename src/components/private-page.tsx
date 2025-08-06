import { navigate } from "gatsby"
import React, { useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { x25log } from "../utils/log"

type PrivatePageProps = {
  path: string,
  children: React.ReactNode
}


const PrivatePage: React.FC<PrivatePageProps> = ({ path, children }) => {
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    x25log.d("[useEffect][PrivatePage.tsx]: Path: %s.", path);

    if ( !isLoggedIn ){
      // return <p>not logged in.</p>
      // navigate("/login");
    }
  }, [])

  // if ( isLoggedIn && path !== "login" && path !== "/login" ){
    // return <>{children}</>;
  // }

  if ( typeof window !== "undefined" && !isLoggedIn ){
    navigate("/login");
    // return null;
  }
  return <div>{children}</div>;
  // return null;
  // return isLoggedIn ? <p>LOGGED IN.</p> : <p>not logged in.</p>
  // return isLoggedIn || path === "login" || path === "/login" ? <>{children}</> : null;
}

export default PrivatePage;