import { navigate } from "gatsby"
import React, { useEffect } from "react"
import { Redirect } from "@reach/router"
// import { useNavigate } from "@reach/router"
import { x25log } from "../utils/log"
import { RouteComponentProps } from "@reach/router"
import useAuth from "../hooks/useAuth"
import { Layout } from "./layout"

type PrivateRouteProps = RouteComponentProps & {
  component: React.ElementType
}


const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, location, ...rest }) => {
  const { loadingUser, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    navigate("/budgets/login", {replace: true, state: { from: location?.pathname }});
    return null;
  }

  return loadingUser ? <p>Loading...</p> : <Layout><Component {...rest} /></Layout>;
}

export default PrivateRoute;