import React, { FC, useContext, useEffect, useState } from "react"
import { BudgetContext } from "../../contexts/budgetContext";
import dayjs, { Dayjs } from "dayjs";
import { calculateOccurrences, getFriday, UpcomingBudgetItem } from "../../utils/budget";
import { get } from "../../utils/strapi";
import { x25log } from "../../utils/log";
import { Occurrence } from "../../hooks/useBudget";
import { OccurrenceCard } from "../occurrence-card";


type WeekChangerProps = {
  mode?: "prev" | "next",
  onChange: (direction: "prev" | "next") => void
}
const WeekChanger: FC<WeekChangerProps> = (props) => {
  const { mode, onChange } = props;

  return (
    <button onClick={() => onChange(mode ?? "next")} className="btn btn-icon btn-light btn-sm">
      <span className="svg-icon svg-icon-4 svg-icon-gray-400">
        {
          mode && mode === "prev" ?
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.2657 11.4343L15.45 7.25C15.8642 6.83579 15.8642 6.16421 15.45 5.75C15.0358 5.33579 14.3642 5.33579 13.95 5.75L8.40712 11.2929C8.01659 11.6834 8.01659 12.3166 8.40712 12.7071L13.95 18.25C14.3642 18.6642 15.0358 18.6642 15.45 18.25C15.8642 17.8358 15.8642 17.1642 15.45 16.75L11.2657 12.5657C10.9533 12.2533 10.9533 11.7467 11.2657 11.4343Z" fill="currentColor" />
            </svg> :
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.6343 12.5657L8.45001 16.75C8.0358 17.1642 8.0358 17.8358 8.45001 18.25C8.86423 18.6642 9.5358 18.6642 9.95001 18.25L15.4929 12.7071C15.8834 12.3166 15.8834 11.6834 15.4929 11.2929L9.95001 5.75C9.5358 5.33579 8.86423 5.33579 8.45001 5.75C8.0358 6.16421 8.0358 6.83579 8.45001 7.25L12.6343 11.4343C12.9467 11.7467 12.9467 12.2533 12.6343 12.5657Z" fill="currentColor" />
            </svg>
        }
      </span>
    </button>
  )
}

export const UpcomingItemsWidget: FC = () => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { date, budget, getOccurrencesBetween } = context;

  if (!budget) {
    return <></>;
  }

  const [localDate, setLocalDate] = useState<Dayjs>(getFriday(date));
  const [upcoming, setUpcoming] = useState<Occurrence[]>()

  const fetch = async (): Promise<void> => {
    const start = localDate;
    const end = localDate.add(6, 'days');

    // calculate occurrences between start and end.
    // ensure items are active.
    const result = await getOccurrencesBetween(start, end);
    if (result.status === "success") {
      x25log.d("[fetch][UpcomingItemsWidget.tsx]: %d upcoming occurrences. Range: %s -> %s.", result.data.length, start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"))
      setUpcoming(result.data.sort((a,b) => a.date.diff(b.date)));

    } else {
      x25log.w("[fetch][UpcomingItemsWidget.tsx]: Error getting occurrences. Details: %s", result.error);
    }
  }

  useEffect(() => {
    fetch();
  }, [])

  return (
    <div className="card mb-6">
      <div className="card-header p-10 pb-2">
        <div className="card-title d-block">
          <h3 className="m-0 text-gray-900">Upcoming Items</h3>
          <div className="my-4"><span className="badge badge-lg badge-light-warning fw-bold">5 items need to be verified.</span></div>
          {/* <p className="text-gray-400 fw-semibold fs-6 mt-2">As of {date.format("dddd, MMM D, YYYY")}</p> */}
        </div>
        <div className="card-toolbar">
          {/* <WeekChanger mode="prev" onChange={(_) => setDate(date.subtract(1, 'week'))} /> */}
          <WeekChanger mode="prev" onChange={(_) => { }} />
          <h3 className="fw-bold mb-1 mx-7">This Week</h3>
          {/* <WeekChanger onChange={(_) => setDate(date.add(1, 'week'))} /> */}
          <WeekChanger onChange={(_) => { }} />
        </div>
      </div>

      <div className="py-2">
        <div className="d-flex flex-column">
          {(upcoming ?? []).map((occ, i) => {

            // sum of prior items this week.
            const sum = (upcoming ?? [])
              .slice(0,i + 1)
              .reduce((a,c) => {
                const multiplier = c.item.type === "expense" ? -1 : 1;
                const amount = c.verification && c.verification.amount !== undefined ? c.verification.amount : c.item.amount
                return a + (amount * multiplier)
              }, 0)
            const balance = budget.startOfWeekBalance + sum;
            const newDay = i === 0 ? true : (upcoming ?? [])[i - 1].date.get("day") !== occ.date.get("day")

            return (
              <div key={i}>
                <OccurrenceCard
                  occurrence={occ}
                  date={date}
                  isNewDay={newDay}
                  balance={balance}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}