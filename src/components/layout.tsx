import * as React from "react"

type LayoutProps = {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="d-flex flex-column flex-root">
      <div className="page d-flex flex-row flex-column-fluid">
        <div className="wrapper d-flex flex-column flex-row-fluid">
          <div className="header" style={{ padding: "20px" }}>
            <img style={{ height: "32px" }} src={'/img/logo-compact-craft.svg'} />
          </div>

          <div className="content d-flex flex-column flex-column-fluid">
            <div className="post d-flex flex-column-fluid">
              <div className="container-xxl">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}