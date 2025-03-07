import React, { FC, useContext, useEffect, useState } from "react"
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

import { BudgetItem, BudgetItemFrequency } from "../../utils/schemas";
// import { getFriday, getVerificationOn, UpcomingBudgetItem } from "../../utils/occurrence";
import { getFriday, numberOrNull } from "../../utils/util";

import "../../styles/weekly-widget.css"
import { getTheme } from "../../utils/theme";
import { BudgetContext } from "../../contexts/budgetContext";

dayjs.extend(isSameOrAfter);


type WeeklyWidgetLineItemProps = {
  item: BudgetItem,
  days: number,
  isNewDay: string | null,
  endingBalance: number | null,
  hasPassed: boolean
}

// Model after:
//  apps -> customers -> customer details -> payment methods
//  weekly widget badges - user management -> permissions list

// TODO:
//  - Week widgets lists more than just one week.
//  - MAKE THIS MORE READABLE AND CLEAR

const WeeklyWidgetLineItem: FC<WeeklyWidgetLineItemProps> = (props) => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { date, budget } = context;

  if (!budget) {
    return <></>;
  }

  const theme = getTheme("light");
  const { item, isNewDay, endingBalance, days, hasPassed } = props;
  const currentDay = getFriday(date).add(days, 'day');
  // const verifiedAmt = getVerificationOn(currentDay, item);
  const verifiedAmt = 5;
  const verified = verifiedAmt !== null;

  const [isOpen, setIsOpen] = useState(false);
  const [textInput, setTextInput] = useState<string>(item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }));
  const [loading, setIsLoading] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  }

  const handleTextInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(event.target.value);
  };

  const verify = (unverify: boolean = false) => {
    // let value: number | null;

    // if (unverify) {
    //   value = null;

    // } else {
    //   // Check for empty strings
    //   if (textInput.trim() === "") {
    //     setTextInput("");
    //     return;
    //   }

    //   const cleanedString = textInput.replace(/[^0-9.]/g, '');

    //   // Convert the cleaned string to a number
    //   const num = parseFloat(cleanedString);
    //   if (isNaN(num)) {
    //     setTextInput("");
    //     return;
    //   }
    //   value = num;
    // }

    // setIsLoading(true);
    // verifyAmount(currentDay, item, value);
    // setIsLoading(false);
    // setIsOpen(false);
  }

  useEffect(() => {
    setTextInput(item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }));
    setIsOpen(false);

  }, [props.item]);


  return (
    <div className="line-item-wrapper">
      {isNewDay && <div className="newday mt-6 text-center fs-6 text-gray-400 fw-bold py-2">{isNewDay}</div>}
      <div className={`line-item px-1 py-4 position-relative ${hasPassed ? 'bg-gray-100' : ''}`}>
        <div className="d-flex justify-content-between flex-row align-items-center px-4">
          <div className={"line-item-info fw-semibold d-flex flex-row " + (isOpen ? "show" : "")}>
            <div className="me-2 rotate-90">
              <span
                onClick={toggleOpen}
                className="text-gray-400 fc-icon cursor-pointer fc-icon-chevron-right">
              </span>
            </div>
            <div className="line-item-checkbox form-check form-check-custom form-check-solid mx-3">
              <input
                className="form-check-input cursor-pointer"
                type="checkbox"
                value=""
                checked={verified}
                onChange={(evt) => verify(!evt.target.checked)}
              />
            </div>
            <div className="line-item-title ms-2 d-flex flex-row flex-wrap">
              <div className="fs-6 fw-bold text-gray-900 mb-1">{item.name}</div>
              {item.frequency === BudgetItemFrequency.weekly &&
                <div><span className="badge badge-light-info fw-bold mx-2">weekly</span></div>
              }
            </div>
          </div>
          <div className="line-item-numbers d-flex flex-row align-items-center">
            <div className="text-gray-900 text-end">
              {verifiedAmt && verifiedAmt != item.amount ?
                <div
                  style={{ color: item.type === "income" ? theme.success : "inherit" }}
                  className="fs-5 fw-bold"
                >
                  <span className="text-decoration-line-through me-2 fs-6">
                    {item.type === "income" && <span>+</span>}
                    ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span style={{ color: theme.primary }}>
                    {item.type === "income" && <span>+</span>}
                    ${verifiedAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div> :
                <div
                  style={{ color: item.type === "income" ? theme.success : "inherit" }}
                  className="fs-5 fw-bold"
                >
                  {item.type === "income" && <span>+</span>}
                  ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              }
              {endingBalance && <div className="text-gray-400 running-balance fs-7">${endingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>}
            </div>
          </div>
        </div>
        {/* collapsable menu */}
        {isOpen &&
          <div className="py-4 d-flex flex-row">
            <div className="me-4">
              <input
                type="text"
                className="form-control form-control-solid py-2"
                value={textInput}
                onChange={handleTextInput}
                disabled={verified}
              ></input>
            </div>
            <button
              type="submit"
              className="btn btn-primary fs-8 py-0 px-6 min-w-100px"
              data-kt-indicator={loading ? "on" : "off"}
              onClick={() => verify()}
              disabled={verified}
            >
              <span className="indicator-label">Verify</span>
              <span className="indicator-progress">Verifying...
                <span className="spinner-border spinner-border-sm align-middle ms-2"></span></span>
            </button>
          </div>
        }
      </div>
    </div>
  )
}

export const WeeklyWidget: FC = () => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { date, budget, setDate } = context;

  if (!budget) {
    return <></>;
  }

  // const { startDate: startdate, startAmount } = budget;

  const friday = getFriday(date);
  const nextFriday = friday.add(7, 'day');
  // const budgetInProgress = !startdate.isAfter(friday);
  // const budgetStartsThisWeek = !startdate.isBefore(friday) && startdate.isBefore(nextFriday);
  // const budgetNotThisWeek = !startdate.isBefore(nextFriday);

  const getWeekStartingBalance = (): number | null => {
    // if (budgetInProgress) {
    //   const balance = calculateBalance(budget.startDate, budget.startingBalance, budget.items, friday);
    //   return numberOrNull(balance);
    // }
    return null;
  }

  // const items = getUpcomingBudgetItems(getFriday(date), 6, budget.items);

  const weekStartingBalance = getWeekStartingBalance();
  const balanceAfterItem = (i: number): number | null => {
    // if (budgetNotThisWeek) { return null; }

    let runningBalance: number | null = weekStartingBalance;
    let j = i;

    // Tally balance.
    // while (j >= 0) {
    //   const _item = items[j];
    //   const today = friday.add(_item.days, 'day');
    //   const verifiedAmount = getVerificationOn(today, _item.item);

    //   if (runningBalance === null) {
    //     if (budgetStartsThisWeek && !today.isBefore(startdate, 'date')) {
    //       runningBalance = startingBalance;
    //     }
    //   }

    //   if (runningBalance !== null) {
    //     runningBalance += (verifiedAmount ?? _item.item.amount) * (_item.item.type === "expense" ? -1 : 1);
    //   }

    //   j--;
    // }
    return runningBalance;
  }

  // const endingBalance: number | null = balanceAfterItem(items.length - 1);

  type WeekChangerProps = {
    mode?: "prev" | "next",
    onChange: (direction: "prev"|"next") => void
  }
  const WeekChanger: FC<WeekChangerProps> = (props) => {
    const { mode, onChange } = props;

    return (
      <button onClick={() => onChange(mode ?? "next")} className="btn btn-icon btn-light btn-sm">
        <span className="svg-icon svg-icon-4 svg-icon-gray-400">
          { 
            mode && mode === "prev" ?
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.2657 11.4343L15.45 7.25C15.8642 6.83579 15.8642 6.16421 15.45 5.75C15.0358 5.33579 14.3642 5.33579 13.95 5.75L8.40712 11.2929C8.01659 11.6834 8.01659 12.3166 8.40712 12.7071L13.95 18.25C14.3642 18.6642 15.0358 18.6642 15.45 18.25C15.8642 17.8358 15.8642 17.1642 15.45 16.75L11.2657 12.5657C10.9533 12.2533 10.9533 11.7467 11.2657 11.4343Z" fill="currentColor"/>
            </svg> :
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.6343 12.5657L8.45001 16.75C8.0358 17.1642 8.0358 17.8358 8.45001 18.25C8.86423 18.6642 9.5358 18.6642 9.95001 18.25L15.4929 12.7071C15.8834 12.3166 15.8834 11.6834 15.4929 11.2929L9.95001 5.75C9.5358 5.33579 8.86423 5.33579 8.45001 5.75C8.0358 6.16421 8.0358 6.83579 8.45001 7.25L12.6343 11.4343C12.9467 11.7467 12.9467 12.2533 12.6343 12.5657Z" fill="currentColor" />
          </svg>
          }
        </span>
      </button>
    )
  }

  return (
    // print line items for this week in order.

    <div className="x25-line-item-list">
      {/* <div className="card card-flush p-4">
        <div className="card-header px-6">
          <div className="card-title flex-row d-flex">
            <WeekChanger mode="prev" onChange={(_) => setDate(date.subtract(1, 'week'))} />
            <h3 className="fw-bold mb-1 mx-7">This Week</h3>
            <WeekChanger onChange={(_) => setDate(date.add(1, 'week'))}  />
          </div>
          <div className="card-toolbar">
            <a href="#" className="btn btn-bg-light btn-active-color-primary btn-sm">View All</a>
          </div>
        </div>

        <div className="px-6 mb-4"><span className="badge badge-lg badge-light-warning fw-bold">XX Verifications Due</span></div>

        <div className="d-flex flex-wrap py-2 px-6">
          <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
            <div className="d-flex align-items-center">
              <div className="fs-2 fw-bold counted">{items.length}</div>
            </div>
            <div className="fw-semibold fs-6 text-gray-400">Budget Item{items.length > 1 && <span>s</span>}</div>
          </div>
          {weekStartingBalance &&
            <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
              <div className="d-flex align-items-center">
                <div className="fs-2 fw-bold counted">${weekStartingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="fw-semibold fs-6 text-gray-400">Start Balance</div>
            </div>
          }
          {endingBalance &&
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
          }
        </div>

        <div className="d-flex flex-column">
          {items.map((_item, i) => {
            const current = friday.add(_item.days, 'day');
            const endingBalance = balanceAfterItem(i);
            const hasPassed: boolean = dayjs().isSameOrAfter(current);

            let isNewDay = i === 0 || _item.days !== items[i - 1].days
              ? current.format('dddd, M/D')
              : null

            return (
              <div key={i}>
                <WeeklyWidgetLineItem
                  item={_item.item}
                  days={_item.days}
                  isNewDay={isNewDay}
                  endingBalance={endingBalance}
                  hasPassed={hasPassed}
                />
              </div>
            )
          })}
        </div>
      </div> */}
    </div>
  )
};