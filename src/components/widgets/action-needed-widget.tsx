import React, { FC, useContext, useEffect, useState } from "react"
import { BudgetContext } from "../../contexts/budgetContext";
import dayjs, { Dayjs } from "dayjs";
// import { calculateOccurrences, getFriday, UpcomingBudgetItem } from "../../utils/occurrence";
// import { get } from "../../utils/strapi";
import { x25log } from "../../utils/log";
// import { Occurrence } from "../../utils/occurrence";
import { Occurrence } from "../../hooks/useOccurrences";
import { OccurrenceCard } from "../occurrence-card";
import { calculateOccurrences } from "../../utils/occurrence";
import { getFriday } from "../../utils/util";
// import { Schema, x25Result } from "../../utils/strapi";
import { calculateBalance } from "../../utils/balance";
// import { VerificationMap } from "../../hooks/useBudget";
import { x25Result } from "../../utils/types";
import { OccurrencesContext } from "../../contexts/occurrencesContext";


// type WeekChangerProps = {
//   mode?: "prev" | "next",
//   onChange: (direction: "prev" | "next") => void
// }
// const WeekChanger: FC<WeekChangerProps> = (props) => {
//   const { mode, onChange } = props;

//   return (
//     <button onClick={() => onChange(mode ?? "next")} className="btn btn-icon btn-sm">
//       <span className="svg-icon svg-icon-4 svg-icon-gray-400">
//         {
//           mode && mode === "prev" ?
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path d="M11.2657 11.4343L15.45 7.25C15.8642 6.83579 15.8642 6.16421 15.45 5.75C15.0358 5.33579 14.3642 5.33579 13.95 5.75L8.40712 11.2929C8.01659 11.6834 8.01659 12.3166 8.40712 12.7071L13.95 18.25C14.3642 18.6642 15.0358 18.6642 15.45 18.25C15.8642 17.8358 15.8642 17.1642 15.45 16.75L11.2657 12.5657C10.9533 12.2533 10.9533 11.7467 11.2657 11.4343Z" fill="currentColor" />
//             </svg> :
//             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path d="M12.6343 12.5657L8.45001 16.75C8.0358 17.1642 8.0358 17.8358 8.45001 18.25C8.86423 18.6642 9.5358 18.6642 9.95001 18.25L15.4929 12.7071C15.8834 12.3166 15.8834 11.6834 15.4929 11.2929L9.95001 5.75C9.5358 5.33579 8.86423 5.33579 8.45001 5.75C8.0358 6.16421 8.0358 6.83579 8.45001 7.25L12.6343 11.4343C12.9467 11.7467 12.9467 12.2533 12.6343 12.5657Z" fill="currentColor" />
//             </svg>
//         }
//       </span>
//     </button>
//   )
// }

export const ActionNeededWidget: FC = () => {
  const budgetContext = useContext(BudgetContext);

  if (!budgetContext) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const occurrencesContext = useContext(OccurrencesContext);

  if (!budgetContext) {
    throw new Error("Calling occurrence Context from outside of provider.");
  }

  const { date, data } = budgetContext;

  // if ( !budget ) {
  //   return <></>;
  // }

  // const { startDate, startAmount } = budget;

  // if ( startDate === undefined || startAmount === undefined ){ 
  //   return <></>; 
  // }

  // const [localDate, setLocalDate] = useState<Dayjs>(getFriday(date));
  const [upcoming, setUpcoming] = useState<Occurrence[]>()
  const [balance, setBalance] = useState<number>();

  const verificationsDue = (upcoming ?? []).filter(occ => occ.verification === undefined).length;
  // const verificationsDue = 0

  const getStartingBalance = async (): Promise<void> => {
    // fetch verifications for balance.
    // const budgetStart = dayjs(budget.startDate);

    // Factor in budget start date.
    // Get all verifications from budget start until the start of the given week.
    // If the weeks end date is before start date, return nothing.
    // If the weeks end date is before the budget start return nothing.
    // If budget start is after week start, use budget start date for lower bound.

    // const start = localDate;
    // const end = localDate.add(6, 'days');

    // const response: x25Result<VerificationMap> = await getVerifications(budget.startDate, end);
    // if (response.status === "success") {
    //   // getItems().map( i => { i.})
    //   const occurrences: Occurrence[] = calculateOccurrences( getItems(), start, end);
    //   occurrences.forEach( occ => {
    //     const d = occ.date.format("YYYY-MM-DD");
    //     const doc = occ.item.documentId;
    //     occ.verification = d in response.data && doc in response.data[d] ? response.data[d][doc] : undefined
    //   });
    //   const balance = calculateBalance( budget.startAmount, occurrences);
    //   setBalance(balance);

    // } else {
    //   x25log.d("[getStartingBalance][UpcomingItemsWidget.tsx]: Unable to calculate start of week balance for budget %s on %s.", budget.title ?? "--", start.format("YYYY-MM-DD"));
    //   // do some error handling.
    // }
  }

  // const fetch = async (): Promise<void> => {
  //   const start = localDate;
  //   const end = localDate.add(6, 'days');

  //   // const startBalance = await getStartingBalance();

  //   // fetch verifications within span.
  //   const response = await getVerifications(start, end);

  //   if (response.status === "success") {
  //     // calculate occurrences between start and end.
  //     // ensure items are active.
  //     const occurrences = calculateOccurrences(budget.items, start, end);
  //     occurrences.forEach(occ => {
  //       const d = occ.date.format("YYYY-MM-DD");
  //       const doc = occ.item.documentId;
  //       occ.verification = d in response.data && doc in response.data[d] ? response.data[d][doc] : undefined
  //     })
  //     setUpcoming(occurrences.sort((a, b) => a.date.diff(b.date)))

  //   } else {
  //     x25log.d("[fetch][UpcomingItemsWidget.tsx]: Unable to fetch upcoming items for budget %s between %s and %s.", budget.title ?? "--", start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"));
  //     // some error handling.
  //   }
  // }

  // useEffect(() => {
  //   getStartingBalance();
  // }, [])

  // useEffect(() => {
  //   getStartingBalance();
  // }, [localDate])

  // useEffect(() => {
  //   fetch();
  // }, [balance])

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
        <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
          <div className="fw-bold fs-6 text-warning text-center">This Week</div>
            <div className="fs-1 fw-bold counted text-center">30</div>
        </div>
        <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
          <div className="fw-bold fs-6 text-danger text-center">This Week</div>
            <div className="fs-1 fw-bold counted text-center">30</div>
        </div>
      </div>

      <div className="py-2 row">
        <div className="col-lg-6">
          {(upcoming ?? []).map((occ, i) => {
            let sum: number | undefined = 0; // sum of upcoming occurrences before current.

            if (balance !== undefined && occ.item.amount !== undefined) {
              (upcoming ?? [])
                .slice(0, i + 1) // get upcoming occurrences up to and including the current one.
                .map(o => {
                  // if (sum === undefined || o.item.type === undefined) {
                  //   sum = undefined;
                  //   return
                  // }

                  // const multiplier = o.item.type === "expense" ? -1 : 1;
                  // const amount = o.verification && o.verification.amount !== undefined ? o.verification.amount : o.item.amount

                  // if (undefined === amount) {
                  //   sum = undefined;
                  //   return amount;
                  // }
                  // sum += (amount * multiplier)
                })
              sum = sum === undefined ? sum : balance + sum;
            }
            const newDay = i === 0 ? true : (upcoming ?? [])[i - 1].date.get("day") !== occ.date.get("day")

            return (
              <div key={i}>
                <OccurrenceCard
                  occurrence={occ}
                  date={date}
                  isNewDay={newDay}
                  balance={sum}
                />
              </div>
            )
          })}
        </div>
        <div className="col-lg-6">
          {/* {verificationsDue > 0 && <div className="my-4"><span className="badge badge-lg badge-light-warning fw-bold">{verificationsDue} item{verificationsDue === 1 ? '' : 's'} need to be verified.</span></div>}

          <div className="d-flex flex-wrap py-2 px-6">
            <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
              <div className="d-flex align-items-center">
                <div className="fs-2 fw-bold counted">35</div>
              </div>
              <div className="fw-semibold fs-6 text-gray-400">Budget Items</div>
            </div>
            {balance !== undefined &&
              <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                <div className="d-flex align-items-center">
                  <div className="fs-2 fw-bold counted">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="fw-semibold fs-6 text-gray-400">Start Balance</div>
              </div>
            } */}
            {/* {endingBalance &&
              <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                <div className="d-flex align-items-center">
                  {weekStartingBalance &&
                    (weekStartingBalance <= endingBalance ?
                      <span className="svg-icon svg-icon-3 svg-icon-success me-2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect opacity="0.5" x="13" y="6" width="13" height="2" rx="1" transform="rotate(90 13 6)" fill="currentColor"></rect>
                          <path d="M12.5657 8.56569L16.75 12.75C17.1642 13.1642 17.8358 13.1642 18.25 12.75C18.6642 12.3358 18.6642 11.6642 18.25 11.25L12.7071 5.70711C12.3166 5.31658 11.6834 5.31658 11.2929 5.70711L5.75 11.25C5.33579 11.6642 5.33579 12.3358 5.75 12.75C6.16421 13.1642 6.83579 13.1642 7.25 12.75L11.4343 8.56569C11.7467 8.25327 12.2533 8.25327 12.5657 8.56569Z" fill="currentColor"></path>
                        </svg>
                      </span> :
                      <span className="svg-icon svg-icon-3 svg-icon-danger me-2">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect opacity="0.5" x="11" y="18" width="13" height="2" rx="1" transform="rotate(-90 11 18)" fill="currentColor"></rect>
                          <path d="M11.4343 15.4343L7.25 11.25C6.83579 10.8358 6.16421 10.8358 5.75 11.25C5.33579 11.6642 5.33579 12.3358 5.75 12.75L11.2929 18.2929C11.6834 18.6834 12.3166 18.6834 12.7071 18.2929L18.25 12.75C18.6642 12.3358 18.6642 11.6642 18.25 11.25C17.8358 10.8358 17.1642 10.8358 16.75 11.25L12.5657 15.4343C12.2533 15.7467 11.7467 15.7467 11.4343 15.4343Z" fill="currentColor"></path>
                        </svg>
                      </span>
                    )}
                  <div className="fs-2 fw-bold counted">${endingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="fw-semibold fs-6 text-gray-400">End Balance</div>
              </div>
            } */}
          {/* </div> */}
        </div>
      </div>
    </div>
  )
}