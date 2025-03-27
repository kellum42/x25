import React, { FC } from "react";
import { Link } from "gatsby"

import { Budget } from "../utils/schemas";
import { svgs } from "../utils/svg";
import { Menu, MenuItem } from "./floating-menu";
import { deleteBudget } from "../utils/localStorage";
import { Schema } from "../utils/strapi";
import { calculateBalance } from "../utils/balance";
import { calculateOccurrences } from "../utils/occurrence";
import { x25log } from "../utils/log";
import dayjs from "dayjs";

type BudgetCardProps = {
  budget: Schema<"budget">,
  onDeleteSuccess: () => void
}

const BudgetCard: FC<BudgetCardProps> = (props) => {
  const { budget, onDeleteSuccess } = props;

  const {items, startDate, startAmount} = budget;
  
  if (items === undefined || startDate === undefined || startAmount === undefined){
    x25log.e("[BudgetCard][budget-card.tsx]: Budget %s items, startdate, or startmount is undefined. Couldn't render BudgetCard component.", budget.title ?? "--")
    return <></>
  }

  const onDelete = () => {
    const response = deleteBudget( budget.id );
    if ( response.status === "success" ){
      onDeleteSuccess();
    } else {
      console.log(response.message);
    }
  }

  const occurrences = calculateOccurrences(items, dayjs(startDate), dayjs())
  const balance = calculateBalance(startAmount, occurrences);

  return (
    <div className="col-sm-6 col-xl-4 mb-6">
      <div className="card h-100">
        <div className="card-header flex-nowrap border-0 pt-9">
          <div className="card-title m-0">
            {/* {budget.avatar &&
              <div className="symbol symbol-45px me-5">
                <span className={`symbol-label bg-${budget.avatar.bg}`}>
                  <span className={`svg-icon svg-icon-2 svg-icon-${budget.avatar.color}`}>
                    {budget.avatar !== undefined && svgs[budget.avatar.svg]}
                  </span>
                </span>
              </div>
            } */}
            <Link to={`/budget/${budget.documentId}`} className="fs-4 fw-semibold text-hover-primary text-gray-600 m-0">{budget.title}</Link>
          </div>
          <div className="card-toolbar m-0">
            <Menu label="">
              <MenuItem label="Delete" onClick={() => {onDelete() }} />
            </Menu>
          </div>
        </div>
        <div className="card-body d-flex flex-column px-9 pt-6 pb-8">
          <div className="fw-semibold text-gray-400 text-gray-400 fs-7">Balance Today:</div>
          <div className="fs-2tx fw-bold mb-3" style={{ color: "#000000" }}>$
            {balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="d-flex align-items-center flex-wrap mb-5 mt-auto fs-6">
            <div className="fw-bold text-danger me-2">+40.5%</div>
            <div className="fw-semibold text-gray-400">more impressions</div>
          </div>
          <div className="d-flex flex-row flex-stack">
            <div className="d-flex align-items-center fw-semibold">
              <span className="badge bg-light text-gray-700 px-3 py-2 me-2">{(budget.items ?? []).length} budget items</span>
              <span className="text-gray-400 fs-7">MRR</span>
              <i className="fas fa-exclamation-circle fs-7 ms-2" data-bs-toggle="tooltip" aria-label="Recurring" data-kt-initialized="1"></i>
            </div>
            <Link to={`/budget/${budget.id}`} className="btn btn-icon btn-light btn-sm">
              <span className="svg-icon svg-icon-4 svg-icon-gray-400">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect opacity="0.5" x="18" y="13" width="13" height="2" rx="1" transform="rotate(-180 18 13)" fill="currentColor"></rect>
                  <path d="M15.4343 12.5657L11.25 16.75C10.8358 17.1642 10.8358 17.8358 11.25 18.25C11.6642 18.6642 12.3358 18.6642 12.75 18.25L18.2929 12.7071C18.6834 12.3166 18.6834 11.6834 18.2929 11.2929L12.75 5.75C12.3358 5.33579 11.6642 5.33579 11.25 5.75C10.8358 6.16421 10.8358 6.83579 11.25 7.25L15.4343 11.4343C15.7467 11.7467 15.7467 12.2533 15.4343 12.5657Z" fill="currentColor"></path>
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;