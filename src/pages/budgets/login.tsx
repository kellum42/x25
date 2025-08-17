import React, { useContext, useEffect, useState } from "react"
import { RouteComponentProps } from "@reach/router"
import type { PageProps, HeadFC } from "gatsby"
import { Link, navigate } from "gatsby"

import { x25log } from "../../utils/log"
import useAuth from "../../hooks/useAuth";
import { AuthContext, AuthProvider, LoginStatus } from "../../contexts/authContext"

// import { AuthProvider } from "../../contexts/authContext"


const Login: React.FC<RouteComponentProps> = (props) => {
  const previous = props.location?.state as { from?: string };
  const { demoLogin, isLoggedIn } = useAuth();

  const [loading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    // If user is already logged in, just go to dashboards page.
    if ( isLoggedIn === LoginStatus.Yes ){
      navigate("/budgets", {replace: true })
    }

  }, [isLoggedIn])
  


  const onDemoLogin = async () => {
    x25log.d("[onDemoLogin][login.tsx]: Attempting demo login.");

    setIsLoading(true);
    const hasLoggedIn = await demoLogin();
    setIsLoading(false);

    // console.log("RESULT WAS %s", result.toString())
    if ( hasLoggedIn ){
      navigate(previous.from ?? "/budgets");
      // console.log("USER HAS LOGGED IN");

    } else {
      x25log.d("[onDemoLogin][login.tsx]: Login failed.");
      // navigate("/budgets")
    }    
  }

  return (
    // <AuthProvider>
      // <AuthContext.Consumer>
        <div className="d-flex flex-column flex-root vh-100">
        <div className="d-flex flex-column flex-lg-row flex-column-fluid">
          <div className="d-flex flex-column flex-lg-row-auto bg-primary w-xl-600px positon-xl-relative">
            <div className="d-flex flex-column position-xl-fixed top-0 bottom-0 w-xl-600px scroll-y">
              <div className="d-flex flex-row-fluid flex-column text-center p-5 p-lg-10 pt-lg-20">

                <a href="../dist/index.html" className="py-2 py-lg-20">
                  <img alt="Logo" src="assets/media/logos/logo-ellipse.svg" className="h-60px h-lg-70px" />
                </a>
                <h1 className="d-none d-lg-block fw-bold text-white fs-2qx pb-5 pb-md-10">Welcome to Craft</h1>
                <p className="d-none d-lg-block fw-semibold fs-2 text-white">Plan your blog post by choosing a topic creating
                  <br />an outline and checking facts</p>
              </div>
              <div className="d-none d-lg-block d-flex flex-row-auto bgi-no-repeat bgi-position-x-center bgi-size-contain bgi-position-y-bottom min-h-100px min-h-lg-350px" style={{ backgroundImage: "url(assets/media/illustrations/sigma-1/17.png)" }}></div>
            </div>
          </div>
          <div className="d-flex flex-column flex-lg-row-fluid py-10">
            <div className="d-flex flex-center flex-column flex-column-fluid">
              <div className="w-lg-500px p-10 p-lg-15 mx-auto w-100">
                <form className="form w-100 fv-plugins-bootstrap5 fv-plugins-framework" id="kt_sign_in_form" data-kt-redirect-url="../dist/index.html" action="#">
                  <div className="text-center mb-10">
                    <h1 className="text-dark mb-3">Sign in to 25x</h1>
                    {/* <div className="text-gray-400 fw-semibold fs-4">New Here? */}
                    {/* <a href="../dist/authentication/sign-up/basic.html" className="link-primary fw-bold">Create an Account</a></div> */}
                  </div>

                  {/* <div className="fv-row mb-10 fv-plugins-icon-container">
                  <label className="form-label fs-6 fw-bold text-dark">Email</label>
                  <input className="form-control form-control-lg form-control-solid" type="text" name="email" autoComplete="off" />
                  <div className="fv-plugins-message-container invalid-feedback"></div>
                </div>

                <div className="fv-row mb-10 fv-plugins-icon-container">
                  <div className="d-flex flex-stack mb-2">
                    <label className="form-label fw-bold text-dark fs-6 mb-0">Password</label>
                    <a href="../dist/authentication/sign-in/password-reset.html" className="link-primary fs-6 fw-bold">Forgot Password ?</a>
                  </div>

                  <input className="form-control form-control-lg form-control-solid" type="password" name="password" autoComplete="off" />
                  <div className="fv-plugins-message-container invalid-feedback"></div>
                </div> */}

                  <div className="text-center">
                    <button type="button" onClick={() => { onDemoLogin() }} className="btn btn-lg btn-primary w-100 mb-5" data-kt-indicator={loading ? "on" : "off"}>
                      <span className="indicator-label">Go to Demo</span>
                      <span className="indicator-progress">Please wait...
                        <span className="spinner-border spinner-border-sm align-middle ms-2"></span></span>
                    </button>

                    {/* <div className="text-center text-muted text-uppercase fw-bold mb-5">or</div> */}

                    {/* <a href="#" className="btn btn-flex flex-center btn-light btn-lg w-100 mb-5">
                      <img alt="Logo" src="/img/google-icon.svg" className="h-20px me-3" />
                      Continue with Google
                    </a> */}

                    {/* <a href="#" className="btn btn-flex flex-center btn-light btn-lg w-100 mb-5">
                    <img alt="Logo" src="assets/media/svg/brand-logos/facebook-4.svg" className="h-20px me-3" />Continue with Facebook</a>

                  <a href="#" className="btn btn-flex flex-center btn-light btn-lg w-100">
                    <img alt="Logo" src="assets/media/svg/brand-logos/apple-black.svg" className="theme-light-show h-20px me-3" />
                    <img alt="Logo" src="assets/media/svg/brand-logos/apple-black-dark.svg" className="theme-dark-show h-20px me-3" />Continue with Apple</a> */}
                  </div>
                </form>
              </div>
            </div>

            <div className="d-flex flex-center flex-wrap fs-6 p-5 pb-0">
              {/* <div className="d-flex flex-center fw-semibold fs-6">
              <a href="https://keenthemes.com" className="text-muted text-hover-primary px-2" target="_blank">About</a>
              <a href="https://devs.keenthemes.com" className="text-muted text-hover-primary px-2" target="_blank">Support</a>
              <a href="https://themes.getbootstrap.com/product/craft-bootstrap-5-admin-dashboard-theme" className="text-muted text-hover-primary px-2" target="_blank">Purchase</a>
            </div> */}
            </div>
          </div>
        </div>
      </div>
      // </AuthContext.Consumer>
      
    // </AuthProvider>
      
  )
}

export default Login;

// export const Head: HeadFC = () => (
//   <>
//     <title>Your Budget</title>
//     <body className="aside-fixed aside-default-enabled" />
//   </>
// )