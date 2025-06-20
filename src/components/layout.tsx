import React, { useEffect } from "react"

import { SideMenu } from "./side-menu"
import { Link } from "gatsby"

type LayoutProps = {
  children: React.ReactNode
  budget?: string // documentId of current budget, if exists.
  uri?: string
}

export const Layout: React.FC<LayoutProps> = ({ children, budget, uri }) => {
  const [menuOpen, setIsMenuOpen] = React.useState(true);

  const setMenu = (on: boolean) => {
    if (typeof window !== "undefined") {
      // const v = menuOpen ? "on" : "off";
      document.body.setAttribute("data-kt-aside-minimize", on ? "off" : "on"); 
    }
    setIsMenuOpen(on)
  }

  const page = uri?.split("/").pop();

  useEffect(() => {
    // document.body.setAttribute("data-kt-aside-minimize", "of"); 
    setMenu(false);
  }, [])

  return (
    <div className="d-flex flex-column flex-root">
      <div className="page d-flex flex-row flex-column-fluid">
        {/* toggle drawer on based on menu click */}
        {/* drawer drawer-start drawer-on */}
        <div id="mainmenu" className={`aside aside-default aside-hoverable drawer drawer-start ${menuOpen ? 'active drawer-on' : ''}`}>
          <SideMenu budget={budget} page={page} />
        </div>
        <div className="wrapper d-flex flex-column flex-row-fluid">
          <div className="header" style={{ padding: "20px" }}>
            <div className="container-fluid d-flex align-items-stretch justify-content-between">
              <div className="d-flex align-items-center flex-grow-1 flex-lg-grow-0">
								<div className="d-flex align-items-center d-lg-none">
									<div onClick={() => { setMenu(!menuOpen) }} className="btn btn-icon btn-active-color-primary ms-n2 me-1" id="kt_aside_toggle">
										<span className="svg-icon svg-icon-1">
											<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M21 7H3C2.4 7 2 6.6 2 6V4C2 3.4 2.4 3 3 3H21C21.6 3 22 3.4 22 4V6C22 6.6 21.6 7 21 7Z" fill="currentColor"></path>
												<path opacity="0.3" d="M21 14H3C2.4 14 2 13.6 2 13V11C2 10.4 2.4 10 3 10H21C21.6 10 22 10.4 22 11V13C22 13.6 21.6 14 21 14ZM22 20V18C22 17.4 21.6 17 21 17H3C2.4 17 2 17.4 2 18V20C2 20.6 2.4 21 3 21H21C21.6 21 22 20.6 22 20Z" fill="currentColor"></path>
											</svg>
										</span>
									</div>
								</div>
								<Link to="/" className="d-lg-none">
									<img alt="Logo" src={'/img/logo-compact-craft.svg'} className="mh-30px" />
								</Link>
								<div className={`btn btn-icon w-auto ps-0 btn-active-color-primary d-none d-lg-inline-flex me-2 me-lg-5 ${menuOpen ? '' : 'active'}`} data-kt-toggle="true" data-kt-toggle-state="active" data-kt-toggle-target="body" data-kt-toggle-name="aside-minimize">
									<span onClick={() => { setMenu(!menuOpen) }} className="svg-icon svg-icon-2 rotate-180">
										<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path d="M9.60001 11H21C21.6 11 22 11.4 22 12C22 12.6 21.6 13 21 13H9.60001V11Z" fill="currentColor"></path>
											<path d="M6.2238 13.2561C5.54282 12.5572 5.54281 11.4429 6.22379 10.7439L10.377 6.48107C10.8779 5.96697 11.75 6.32158 11.75 7.03934V16.9607C11.75 17.6785 10.8779 18.0331 10.377 17.519L6.2238 13.2561Z" fill="currentColor"></path>
											<rect opacity="0.3" x="2" y="4" width="2" height="16" rx="1" fill="currentColor"></rect>
										</svg>
									</span>
								</div>
							</div>
            </div>
          </div>

          <div className="content d-flex flex-column flex-column-fluid">
            <div className="post d-flex flex-column-fluid">
              <div className="container-xxl px-8">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
      { menuOpen && 
        <div 
          style={{zIndex: 109}} 
          className="drawer-overlay d-lg-none" 
          onClick={() => { setMenu(false) }}
        >
        </div> 
      }
    </div>
  )
}