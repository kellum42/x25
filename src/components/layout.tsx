import * as React from "react"
import type { PageProps } from "gatsby"

export const Layout: React.FC<PageProps> = ({children}) => {
    return (
        <div className="d-flex flex-column flex-root">
            <div className="page d-flex flex-row flex-column-fluid">
                <div className="wrapper d-flex flex-column flex-row-fluid">
                    <div>
                        <img style={{ height: "32px" }} src={'/img/logo-compact-craft.svg'} />
                    </div>

                    <div className="content fs-6 d-flex flex-column flex-column-fluid">
                        <div className="post fs-6 d-flex flex-column-fluid">
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