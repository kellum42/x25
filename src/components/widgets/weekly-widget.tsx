import React, { FC, useContext, useEffect, useState } from "react"
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

import "../../styles/weekly-widget.css"
// import { getTheme } from "../../utils/theme";
import { BudgetContext } from "../../deprecated/budgetContext";
import { Occurrence, OccurrenceMap, useOccurrences } from "../../hooks/useOccurrences";
import { ItemFrequency, Schema } from "../../utils/types";
import { x25log } from "../../utils/log";
import { VerifyOccurrenceRow } from "../verify-occurrence-row";
import { SeeMore } from "../see-more";
import { getFriday } from "../../utils/util";

dayjs.extend(isSameOrAfter);

type WeeklyWidgetProps = {
  occurrenceMap: OccurrenceMap,
  startAmount?: number,
  itemMap: Record<string, { name?: string, frequency?:  ItemFrequency }>
}

export const WeeklyWidget: FC<WeeklyWidgetProps> = (props) => {
  const weekStart = getFriday(dayjs())
  const weekEnd = weekStart.add(6, 'days')

  const { occurrenceMap, itemMap, startAmount } = props;
  
  const { 
    getOccurrences, 
    getBalance, 
    addVerifications: addVerificationToMap, 
    deleteVerification: removeVerificationFromMap,
    setStartAmount
  } = useOccurrences( occurrenceMap, startAmount );

  const occurrences = getOccurrences( weekStart, weekEnd );
  const weekStartingBalance = getBalance(weekStart, "start") ?? undefined
  const weekDescription = `${weekStart.format("MMM DD, YYYY")} - ${weekEnd.format("MMM DD, YYYY")}`

  const getWeekEndingBalance = (): number | undefined => {
    let bal = weekStartingBalance;
    occurrences.forEach(occ => {
      bal = occ.balance;
    })
    return bal;
  }


  const weekEndingBalance: number|undefined = getWeekEndingBalance();

  useEffect(() => {
    setStartAmount(startAmount)
  }, [startAmount])


  return (
    // print line items for this week in order.

    <div className="x25-line-item-list mb-6">
      <div className="card card-flush p-4">
        <div className="card-header px-0">
          <div className="card-title flex-row d-flex">
            <h3 className="fw-bold mb-1">This Week</h3>
          </div>
          <div className="card-toolbar">
            {weekDescription && <p className="text-gray-400 fw-semibold fs-6 mt-2">{weekDescription}</p>}
          </div>
        </div>

        <div className="d-flex flex-wrap py-2">
          {weekStartingBalance !== undefined && <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
            <div className="d-flex align-items-center">
              <div className="fs-2 fw-bold counted">${weekStartingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="fw-semibold fs-6 text-gray-400">Start Balance</div>
          </div>}
          {weekEndingBalance !== undefined &&
            <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
              <div className="d-flex align-items-center">
                <div className="fs-2 fw-bold counted">${weekEndingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
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
                onVerified={(verification) => { addVerificationToMap([verification])}}
                onUnVerified={(verification) => { removeVerificationFromMap(verification)}}
                subLabel={occ.balance === undefined ? undefined : "$" + occ.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                beforeRow={newDayLabel}
                item={ itemMap[occ.item.documentId] }
              />
            })}
          />
        </div>
      </div>
    </div>
  )
};