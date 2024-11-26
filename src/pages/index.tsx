import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
// import {header} from '../components/index.module.css'
import BudgetCard from '../components/budget-card'

// TODO:
//  - Get popup on budget cards working
//  - Ensure it looks good on mobile

const IndexPage: React.FC<PageProps> = () => {

  return (
    <div className="d-flex flex-column flex-root">
      <div className="page d-flex flex-row flex-column-fluid">
        <div className="wrapper d-flex flex-column flex-row-fluid">
          <div className="header" style={{ padding: "20px" }}>
            <img style={{ height: "32px" }} src={'/img/logo-compact-craft.svg'} />
          </div>

          <div className="content fs-6 d-flex flex-column flex-column-fluid">
            <div className="post fs-6 d-flex flex-column-fluid">
              <div className="container-xxl">
                <div className="d-flex flex-wrap flex-stack mb-6">
                  <h3 className="fw-bold my-2">My Budgets</h3>
                  <div className="d-flex align-items-center my-2">
                    <button className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#kt_modal_create_campaign">Add New Budget</button>
                  </div>
                </div>

                <div className="row g-6 g-xl-9">
                  <BudgetCard title="2024 Kellum Budget" />
                  <BudgetCard title="2024 Kellum Budget" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>Custom Title</title>
