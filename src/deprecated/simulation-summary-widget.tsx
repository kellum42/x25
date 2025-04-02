import React, { FC, useContext } from "react"

import { BudgetContext } from "../../contexts/budgetContext";
import { getBudgetByID } from "../../utils/localStorage";
import { Link } from "gatsby";

export const SimulationsSummaryWidget: FC = () => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { budget } = context;

  if (!budget) {
    return <></>;
  }

  const parent = getBudgetByID( budget?.parent ?? "" )

  return (
    <div className="card mb-6">
      <div className="card-header p-10 pb-2">
        <div className="card-title d-block">
          <h3 className="m-0 text-gray-900">Summary</h3>
          <p className="text-gray-400 fw-semibold fs-6 mt-2"> 
            {parent.status === "success" ? 
              <span>Branched From: 
                <Link to={`/budget/${parent.data.slug}`}><span className="ps-2 cursor-pointer text-hover-primary">{ parent.data.title }</span></Link>
              </span> :
              ""
            }
          </p>
        </div>
      </div>

      <div className="card-body pt-7 pb-0 px-0">
        <div className="tab-content">
          <div className="tab-pane fade active show" id="kt_security_summary_tab_pane_hours" role="tabpanel">
            <div className="row p-0 mb-5 px-9">
              <div className="col p-2">
                <div className="border border-dashed border-gray-300 text-center min-w-125px rounded pt-4 pb-2 my-3">
                  <span className="fs-6 fw-semibold text-primary d-block">Start Date</span>
                  <span className="fs-2hx fw-bold text-gray-900 counted">{budget.startDate.format("MM/DD/YYYY")}</span>
                </div>
              </div>
              <div className="col p-2">
                <div className="border border-dashed border-gray-300 text-center min-w-125px rounded pt-4 pb-2 my-3">
                  <span className="fs-6 fw-semibold text-success d-block">Starting Balance</span>
                  <span className="fs-2hx fw-bold text-gray-900 counted">${budget.startingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};