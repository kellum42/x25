import React, { FC, useContext, useEffect, useState } from "react"
import { Link } from "gatsby"

import { BudgetContext } from "../../contexts/budgetContext";
import dayjs, { Dayjs } from "dayjs";
import { x25log } from "../../utils/log";
import { Occurrence } from "../../hooks/useOccurrences";
import { getFriday } from "../../utils/util";


type ActionNeededWidgetProps = {
  date: Dayjs,
  occurrences: Occurrence[]
}

export const ActionNeededWidget: FC<ActionNeededWidgetProps> = (props) => {
  const budgetContext = useContext(BudgetContext);

  if (!budgetContext) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { data } = budgetContext;
  const { date, occurrences } = props;
  const friday = getFriday(date);
  const dueOccs = occurrences.filter(occ => !occ.date.isBefore(friday), 'date');
  const pastOccs = occurrences.filter(occ => occ.date.isBefore(friday), 'date');


  return (
    <div className="card mb-6">
      <div className="card-header p-10 pb-2">
        <div className="card-title d-block">
          <h3 className="m-0 text-gray-900">Action Needed</h3>
          {/* <div className="d-flex flex-row align-items-center justify-content-center">
            <WeekChanger mode="prev" onChange={(_) => { }} />
            <p className="text-gray-400 fs-6 fw-semibold mb-0 mx-3">
              {localDate.format("MMM DD, YYYY")} - {localDate.add(6, 'days').format("MMM DD, YYYY")}
            </p>
            <WeekChanger onChange={(_) => { }} />
          </div> */}
        </div>
      </div>

      <div className="d-flex flex-row py-2 px-6">
        <Link
          to={`/budget/${data.documentId}/action`}
        >
          <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
            <div className="fw-bold fs-6 text-warning text-center">This Week</div>
            <div className="fs-1 fw-bold counted text-center text-body">{dueOccs.length}</div>
          </div>
        </Link>
        <Link
          to={`/budget/${data.documentId}/action`}
        >
          <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
            <div className="fw-bold fs-6 text-danger text-center">Past 3 Months</div>
            <div className="fs-1 fw-bold counted text-center text-body">{pastOccs.length}</div>
          </div>
        </Link>
      </div>
    </div >
  )
}