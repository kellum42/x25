import React, { FC, useContext, useEffect, useState } from "react"
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

import "../../styles/weekly-widget.css"
// import { getTheme } from "../../utils/theme";
import { BudgetContext } from "../../deprecated/budgetContext";
import { Occurrence } from "../../hooks/useOccurrences";
import { Schema } from "../../utils/types";
import { x25log } from "../../utils/log";
import { VerifyOccurrenceRow } from "../verify-occurrence-row";
import { SeeMore } from "../see-more";

dayjs.extend(isSameOrAfter);

type WeeklyWidgetProps = {
  occurrences: Occurrence[],
  range?: string,
  startBal?: number,
  addVerification: (verifications: Schema<"verification">[]) => void,
  deleteVerification: (verifications: Schema<"verification">) => void
}

export const WeeklyWidget: FC<WeeklyWidgetProps> = (props) => {
  // const context = useContext(BudgetContext);

  // if (!context) {
  //   throw new Error("Calling Budget Context from outside of provider.");
  // }

  const { range, startBal, addVerification, deleteVerification } = props;

  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);

  const getEndBalance = (): number | undefined => {
    let bal = startBal;
    occurrences.forEach(occ => {
      bal = occ.balance;
    })
    return bal;
  }


  const endBal: number|undefined = getEndBalance();

  useEffect(() => {
    setOccurrences(props.occurrences);
  }, [props.occurrences])


  return (
    // print line items for this week in order.

    <div className="x25-line-item-list mb-6">
      <div className="card card-flush p-4">
        <div className="card-header px-0">
          <div className="card-title flex-row d-flex">
            <h3 className="fw-bold mb-1">This Week</h3>
          </div>
          <div className="card-toolbar">
            {range && <p className="text-gray-400 fw-semibold fs-6 mt-2">{range}</p>}
          </div>
        </div>

        <div className="d-flex flex-wrap py-2">
          {startBal !== undefined && <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
            <div className="d-flex align-items-center">
              <div className="fs-2 fw-bold counted">${startBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="fw-semibold fs-6 text-gray-400">Start Balance</div>
          </div>}
          {endBal !== undefined &&
            <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
              <div className="d-flex align-items-center">
                <div className="fs-2 fw-bold counted">${endBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="fw-semibold fs-6 text-gray-400">End Balance</div>
            </div>
          }
        </div>

        <div>
          <SeeMore
            items={occurrences.map((occ, i) => {
              const newDayLabel: React.ReactNode|undefined = i === 0 || !occ.date.isSame(occurrences[i-1].date) ?
                <div className="text-muted text-center fw-bold fs-5 mt-4 mb-2">{occ.date.format("dddd, M/D")}</div> :
                undefined;

              return <VerifyOccurrenceRow 
                occ={occ}
                onVerified={(verification) => { addVerification([verification])}}
                onUnVerified={(verification) => { deleteVerification(verification)}}
                subLabel={occ.balance === undefined ? undefined : "$" + occ.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                beforeRow={newDayLabel}
              />
            })}
          />
        </div>
      </div>
    </div>
  )
};