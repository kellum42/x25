import React, { FC, useContext, useEffect, useState } from "react";
import { Occurrence } from "../hooks/useOccurrences";
import { getTheme } from "../utils/theme";
import { BudgetContext } from "../contexts/budgetContext";

type OccurrenceRowProps = {
  occ: Occurrence
  label?: string|React.ReactNode
  subLabel?: string,
  title?: string,
  subtitle?: string,
  showTags?: boolean,
  beforeTitle?: React.ReactNode,
  afterRow?: React.ReactNode,
  beforeRow?: React.ReactNode
}

// Model after:
//  apps -> customers -> customer details -> payment methods
//  weekly widget badges - user management -> permissions list

export const OccurrenceRow: FC<OccurrenceRowProps> = (props) => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { occ, title, subtitle, label, subLabel, showTags, beforeTitle, afterRow, beforeRow } = props;
  const { findItem } = context;

  const item = findItem(occ.item.documentId);

  return (
    <div className="line-item-wrapper">
      <div className="line-item py-4 position-relative">
        { beforeRow }
        <div className="d-flex justify-content-between flex-row align-items-start">
          <div className="align-items-center fw-semibold d-flex flex-row">
            { beforeTitle }
            <div className="line-item-title ms-2 d-flex flex-column flex-wrap">
              <div className="fs-6 text-gray-900 mb-1">{title ?? item?.name ?? "--"}</div>
              { subtitle && <div className="text-muted fs-7 mb-1">{subtitle}</div>}
              { showTags && item?.frequency === "Weekly" &&
                <div><span className="badge badge-light-info fw-bold mx-2">weekly</span></div>
              }
            </div>
          </div>
          <div className="line-item-numbers d-flex flex-row align-items-center">
            <div className="text-gray-900 text-end">
              <div className="fs-5 fw-semibold">{label}</div>
              {subLabel && <div className="text-muted fs-7">{subLabel}</div>}
            </div>
          </div>
        </div>
        { afterRow }
      </div>
    </div>
  )
}