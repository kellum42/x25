import { navigate } from "gatsby"
import React, { useEffect } from "react"
import { Redirect } from "@reach/router"
// import { useNavigate } from "@reach/router"
import { x25log } from "../utils/log"
import { RouteComponentProps } from "@reach/router"
import useAuth from "../hooks/useAuth"
import { Layout } from "./layout"
import { LoginStatus } from "../contexts/authContext"

type PrivateRouteProps = RouteComponentProps & {
  component: React.ElementType
}


const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, location, ...rest }) => {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn === LoginStatus.No) {
    navigate("/budgets/login", {replace: true, state: { from: location?.pathname }});
    return null;
  }

  return isLoggedIn === LoginStatus.Pending ? <p>Loading...</p> : <Layout><Component {...rest} /></Layout>;
}

export default PrivateRoute;