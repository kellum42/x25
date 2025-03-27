import React, { FC, useContext, useEffect, useState } from "react"
import { Link } from "gatsby"
import dayjs, { Dayjs } from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween';

import { BudgetContext } from "../../contexts/budgetContext";
import { x25log } from "../../utils/log";
import { useOccurrences } from "../../hooks/useOccurrences";
// import { calculateBalance, daysTillNextOccurrence, getFriday, getVerificationOn, getVerificationsBetween, getUpcomingBudgetItems } from "../../utils/occurrence";
// import { DateChanger } from "../datechanger";
// import { BudgetLineItemFrequency } from "../../hooks/useBudgetDetails";
// import { BudgetItemFrequency } from "../../utils/schemas";

dayjs.extend(isBetween);

type SummaryWidgetProps = {
  balance: number|null
}

export const SummaryWidget: FC<SummaryWidgetProps> = ({ balance }) => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { date, data, getItems } = context;

  return (
    <div className="card mb-6">
      <div className="card-header p-10 pb-2">
        <div className="card-title d-block">
          <h3 className="m-0 text-gray-900">Summary</h3>
          <p className="text-gray-400 fw-semibold fs-7 mt-2">As of {date.format("dddd, MMM D, YYYY")}</p>
        </div>
      </div>

      <div className="card-body my-0 pb-0 px-0">
        {/* begin::Tab content */}
        <div className="tab-content">
          {/* begin::Tab panel */}
          <div className="tab-pane fade active show" id="kt_security_summary_tab_pane_hours" role="tabpanel">
            {/* begin::Row */}
            <div className="row p-0 mb-5 px-9">
              <p className="text-gray-400 fw-semibold fs-6 mb-0">Current Balance</p>
              {/* <h2 className="m-0 fs-1 text-gray-900">$5,844.23</h2> */}
              <h2 className="m-0 fs-1 text-gray-900">
                ${ balance ? `${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : "--" }
                {/* ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} */}
              </h2>
            </div>
            {/* end::Row */}
          </div>
        </div>
        {/* end::Tab content */}
      </div>

      <div className="px-10 fw-semibold">
        <div className="fs-6 d-flex justify-content-between my-4">
          <Link to={`/budget/${data.documentId}/items`} className="hover text-primary">Budget Items</Link>
          <div className="d-flex">{getItems().length}</div>
        </div>
        <div className="separator separator-dashed"></div>

        <div className="fs-6 d-flex justify-content-between my-4">
          <Link to={`/budget/${data.documentId}#sims`} className="hover text-primary">Simulations</Link>
          <div className="d-flex">0</div>
        </div>
        <div className="separator separator-dashed"></div>

        <div className="fs-6 d-flex justify-content-between my-4">
          <div className="">Starting Balance</div>
          <div className="d-flex">${data.startAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="separator separator-dashed"></div>

        <div className="fs-6 d-flex justify-content-between my-4">
          <div className="">Start Date</div>
          <div className="d-flex">{data.startDate.format("MMM D, YYYY")}</div>
        </div>
      </div>
    </div>
  );
};