import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import {header} from '../components/index.module.css'
import BudgetCard from '../components/budget-card.tsx'

// TODO:
//  - Get popup on budget cards working
//  - Ensure it looks good on mobile

const IndexPage: React.FC<PageProps> = () => {
  return (
    <div className="d-flex flex-column flex-root">
      <div className="page d-flex flex-row flex-column-fluid">
        <div className="wrapper d-flex flex-column flex-row-fluid">
          <div className={header}>
            <img style={{ height: "32px" }} src={'/img/logo-compact-craft.svg'} />
          </div>

          <div className="content fs-6 d-flex flex-column flex-column-fluid">
            <div className="post fs-6 d-flex flex-column-fluid">
              <div className="container-xxl">
                <div className="d-flex flex-wrap flex-stack mb-6">
                  <h3 className="fw-bold my-2">My Budgets
                    {/* <span class="fs-6 text-gray-400 fw-semibold ms-1">30 Days</span> */}
                  </h3>
                  <div className="d-flex align-items-center my-2">
                    {/* <div class="w-100px me-5">
                      <select name="status" data-control="select2" data-hide-search="true" class="form-select form-select-sm bg-body border-body select2-hidden-accessible" data-select2-id="select2-data-7-1brm" tabindex="-1" aria-hidden="true" data-kt-initialized="1">
                        <option value="1" selected="selected" data-select2-id="select2-data-9-yqly">30 Days</option>
                        <option value="2">90 Days</option>
                        <option value="3">6 Months</option>
                        <option value="4">1 Year</option>
                      </select><span class="select2 select2-container select2-container--bootstrap5" dir="ltr" data-select2-id="select2-data-8-nicr" style={{ width: "100%" }}><span class="selection"><span class="select2-selection select2-selection--single form-select form-select-sm bg-body border-body" role="combobox" aria-haspopup="true" aria-expanded="false" tabindex="0" aria-disabled="false" aria-labelledby="select2-status-ji-container" aria-controls="select2-status-ji-container"><span class="select2-selection__rendered" id="select2-status-ji-container" role="textbox" aria-readonly="true" title="30 Days">30 Days</span><span class="select2-selection__arrow" role="presentation"><b role="presentation"></b></span></span></span><span class="dropdown-wrapper" aria-hidden="true"></span></span>
                    </div> */}
                    <button className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#kt_modal_create_campaign">Add New Budget</button>
                  </div>
                </div>

                <div className="row g-6 g-xl-9">
                  <BudgetCard title="2024 Kellum Budget"/>
                  <BudgetCard title="2024 Kellum Budget"/>
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
