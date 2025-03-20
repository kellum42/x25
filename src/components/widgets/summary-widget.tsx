import React, { FC, useContext, useEffect, useState } from "react"
import { Link } from "gatsby"
import dayjs, { Dayjs } from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween';

import { BudgetContext } from "../../contexts/budgetContext";
import { OccurrencesContext } from "../../contexts/occurrencesContext";
import { x25log } from "../../utils/log";
// import { calculateBalance, daysTillNextOccurrence, getFriday, getVerificationOn, getVerificationsBetween, getUpcomingBudgetItems } from "../../utils/occurrence";
// import { DateChanger } from "../datechanger";
// import { BudgetLineItemFrequency } from "../../hooks/useBudgetDetails";
// import { BudgetItemFrequency } from "../../utils/schemas";

dayjs.extend(isBetween);

export const SummaryWidget: FC = () => {
  const context = useContext(BudgetContext);
  const occurrencesContext = useContext(OccurrencesContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  if (!occurrencesContext) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { date, data, getItems } = context;

  // if (!budget) {
  //   return <></>;
  // }

  // const friday = getFriday(date);
  // const balance = calculateBalance(budget.startDate, budget.startingBalance, budget.items, date);

  // Gets the verifications due this week.
  // Friday is the first day of the week.
  // const getVersDue = (): number => {
  //   // const friday = getFriday(date);
  //   const items = getUpcomingBudgetItems(friday, 6, budget.items)
  //   // const items = getWeeksBudgetLineItems(date, budget.startDate, budget.items);
  //   const idealVerCount = items.length;
  //   let actualVerCount = 0;
  //   items.forEach((_item, _) => {
  //     const ver = getVerificationOn(friday.add(_item.days, 'day'), _item.item);
  //     actualVerCount += ver === null ? 0 : 1;
  //   })
  //   return idealVerCount - actualVerCount;
  // };

  // const getPastDueVers = (): { items: number, amount: number } => {
  //   let vers: number = 0;
  //   let expectedVers: number = 0;

  //   let pastDue: number = 0;
  //   let pastDueAmount: number = 0;

  //   const start = date.subtract(3, 'month');
  //   const end = friday.subtract(1, 'day');

  //   budget.items.forEach((item, _) => {
  //     if (item.frequency === BudgetItemFrequency.once) {
  //       if (item.date.isBetween(start, end, 'day', '[]')) {
  //         if (null === getVerificationOn(item.date, item)){
  //           pastDue += 1;
  //           pastDueAmount += item.amount;
  //         }
  //       }
  //     } else {
  //       const _start = start.isBefore(item.starts) ? item.starts : start;
  //       const _end = item.ends !== "-1" && item.ends.isBefore(end) ? item.ends : end;
  //       const _rangeInDays = _end.diff(_start, 'day');

  //       const i = item.frequency === BudgetItemFrequency.monthly ? item.dates.length : 1;
  //       for (let _i = 0; _i < i; _i++) {
  //         const _daysTillFirstOccurrence = daysTillNextOccurrence(item, _start, _i);
  //         if (typeof _daysTillFirstOccurrence === 'string') { return; }

  //         const rangeInDays = _rangeInDays - _daysTillFirstOccurrence;
  //         if (rangeInDays < 0) { return; }
  //         const firstOccurrence = _start.add(_daysTillFirstOccurrence, 'day');

  //         const numOccurrences = item.frequency === BudgetItemFrequency.monthly
  //           ? _end.diff(firstOccurrence, 'month') + 1
  //           : Math.floor(rangeInDays / (item.frequency == BudgetItemFrequency.weekly ? 7 : 14)) + 1

  //         const itemVers = getVerificationsBetween([firstOccurrence, _end], item);
  //         if ( itemVers && itemVers.length < numOccurrences ){
  //           pastDue += numOccurrences - itemVers.length;
  //           pastDueAmount += ( numOccurrences - itemVers.length ) * item.amount;
  //           if ( item.type === "income" ){
  //             console.log(firstOccurrence, _end);
  //             console.log("PAST DUE - %s, occurrences: %d, verifications: %d, amount: %s", item.name, numOccurrences, itemVers.length, item.amount);
  //           }
  //         }
  //       }
  //     }
  //   });
  //   return { items: pastDue, amount: pastDueAmount };
  // };

  // const pastDue = getPastDueVers();

  const [currentBalance, setCurrentBalance] = useState<number|null>(null);
  const { balance } = occurrencesContext;
  
  useEffect(() => {
    x25log.d("[SummaryWidget][summary-widget.tsx]: Start calculating current balance..");
    const _currentBal = balance(date, "end");
    setCurrentBalance(_currentBal);
  }, []);


  return (
    <div className="card mb-6">
      <div className="card-header p-10 pb-2">
        <div className="card-title d-block">
          <h3 className="m-0 text-gray-900">Summary</h3>
          <p className="text-gray-400 fw-semibold fs-7 mt-2">As of {date.format("dddd, MMM D, YYYY")}</p>
        </div>
      </div>

      <div className="card-body my-5 pb-0 px-0">
        {/* begin::Tab content */}
        <div className="tab-content">
          {/* begin::Tab panel */}
          <div className="tab-pane fade active show" id="kt_security_summary_tab_pane_hours" role="tabpanel">
            {/* begin::Row */}
            <div className="row p-0 mb-5 px-9">
              <p className="text-gray-400 fw-semibold fs-6 mt-2 mb-0">Current Balance</p>
              {/* <h2 className="m-0 fs-1 text-gray-900">$5,844.23</h2> */}
              <h2 className="m-0 fs-1 text-gray-900">
                ${ currentBalance ? `${(currentBalance + data.startAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : "--" }
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