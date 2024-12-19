import React, { FC, useState } from "react";
import { Link } from "gatsby"

import { Budget } from "../utils/schemas";
import { svgs } from "../utils/svg";


const BudgetCard: FC<{budget: Budget}> = ({budget}) => {
  return (
    <div className="col-sm-6 col-xl-4">
      <Link to={`/budget/${budget.slug}`}>
        {/* begin::Card */}
        <div className="card h-100">
          {/* begin::Card header */}
          <div className="card-header flex-nowrap border-0 pt-9">
            {/* begin::Card title */}
            <div className="card-title m-0">
              {/* begin::Icon */}
              { budget.avatar && 
                <div className="symbol symbol-45px me-5">
                <span className={`symbol-label bg-${budget.avatar.bg}`}>
                  <span className={`svg-icon svg-icon-2 svg-icon-${budget.avatar.color}`}>
                    {budget.avatar !== undefined && svgs[budget.avatar.svg]}
                  </span>
                </span>
              </div>
              }
              {/* end::Icon */}
              {/* begin::Title */}
              <Link to={`/budget/${budget.slug}`} className="fs-4 fw-semibold text-hover-primary text-gray-600 m-0">{budget.title}</Link>
              {/* end::Title */}
            </div>
            {/* end::Card title */}
            {/* begin::Card toolbar */}
            <div className="card-toolbar m-0">
              {/* begin::Menu */}
            </div>
            {/* end::Card toolbar */}
          </div>
          {/* end::Card header */}
          {/* begin::Card body */}
          <div className="card-body d-flex flex-column px-9 pt-6 pb-8">
            {/* begin::Heading */}
            <div className="fw-semibold text-gray-400 text-gray-400 fs-7">Balance Today:</div>
            <div className="fs-2tx fw-bold mb-3" style={{ color: "#000000" }}>$500.00</div>
            {/* end::Heading */}
            {/* begin::Stats */}
            <div className="d-flex align-items-center flex-wrap mb-5 mt-auto fs-6">
              {/* SVG file not found: icons/duotune/arrows/Up-right.svg */}
              {/* begin::Number */}
              <div className="fw-bold text-danger me-2">+40.5%</div>
              {/* end::Number */}
              {/* begin::Label */}
              <div className="fw-semibold text-gray-400">more impressions</div>
              {/* end::Label */}
            </div>
            {/* end::Stats */}
            {/* begin::Indicator */}
            <div className="d-flex align-items-center fw-semibold">
              <span className="badge bg-light text-gray-700 px-3 py-2 me-2">{budget.items.length} budget items</span>
              <span className="text-gray-400 fs-7">MRR</span>
              <i className="fas fa-exclamation-circle fs-7 ms-2" data-bs-toggle="tooltip" aria-label="Recurring" data-kt-initialized="1"></i>
            </div>
            {/* end::Indicator */}
          </div>
          {/* end::Card body */}
        </div>
        {/* end::Card */}
      </Link>
    </div>
  );
};

export default BudgetCard;