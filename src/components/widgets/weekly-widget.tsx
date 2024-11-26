import React, { FC, useContext, useState } from "react"
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

import { BudgetLineItem, BudgetLineItemFrequency } from "../../hooks/useBudgetDetails";
import { calculateBalance, getFriday, getWeeksBudgetLineItems, getVerificationOn } from "../../utils/budget";
import { numberOrNull } from "../../utils/util";

import "../../styles/weekly-widget.css"
import { getTheme } from "../../utils/theme";
import { BudgetContext } from "../../contexts/budgetContext";

dayjs.extend(isSameOrAfter);


type WeeklyWidgetLineItemProps = {
  item: BudgetLineItem,
  days: number,
  hideWeeklyItems: boolean,
  isNewDay: string | null,
  endingBalance: number | null,
  hasPassed: boolean
}

// Model after:
//  apps -> customers -> customer details -> payment methods
//  weekly widget badges - user management -> permissions list

const WeeklyWidgetLineItem: FC<WeeklyWidgetLineItemProps> = (props) => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { date, budget, verifyAmount } = context;

  if (!budget) {
    return <></>;
  }

  const theme = getTheme("light");
  const { item, hideWeeklyItems, isNewDay, endingBalance, days } = props;
  const show: boolean = !(item.frequency === BudgetLineItemFrequency.Weekly && hideWeeklyItems);
  const currentDay = getFriday(date).add(days, 'day');
  const verifiedAmt = getVerificationOn( currentDay, item );
  const verified = verifiedAmt !== null;

  const [isOpen, setIsOpen] = useState(false);
  const [verifyAmt, setVerifyAmt] = useState(item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }))
  const [loading, setIsLoading] = useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  }

  const verify = (unverify: boolean = false) => {
    let value: number | null;

    if ( unverify ){
      value = null;

    } else {
      // Check for empty strings
      if ( verifyAmt.trim() === "" ){ 
        setVerifyAmt( "" );  
        return; 
      }

      const cleanedString = verifyAmt.replace(/[^0-9.]/g, '');
      
      // Convert the cleaned string to a number
      const num = parseFloat( cleanedString );
      if ( isNaN( num ) ){
        setVerifyAmt( "" );
        return;
      }
      value = num;
    }

    setIsLoading(true);
    verifyAmount(currentDay, item, value);
    setIsLoading(false);
    setIsOpen(false);
  }


  return (
    <div className="line-item-wrapper" style={{ display: show ? "block" : "none" }}>
      {isNewDay && <div className="newday mt-6 text-center fs-6 text-gray-400 fw-bold py-2">{isNewDay}</div>}
      <div className="line-item px-1 py-4 position-relative">
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
              {item.frequency === BudgetLineItemFrequency.Weekly &&
                <div><span className="badge badge-light-warning fw-bold mx-2">weekly</span></div>
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
                className="form-control form-control-solid py-2"
                value={verifyAmt}
                onChange={(evt: React.ChangeEvent<HTMLInputElement>) => setVerifyAmt(evt.target.value)}
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

export const WeeklyWidget: FC = (props) => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { date, budget } = context;

  if (!budget) {
    return <></>;
  }

  const getWeekStartingBalance = (): number | null => {
    if (date.isSame(budget.startDate, 'day')) {
      return budget.startingBalance;

    } else if (date.isAfter(budget.startDate, 'day')) {
      return numberOrNull(calculateBalance(budget.startDate, budget.startingBalance, budget.budgetLineItems, friday));

    }
    return null;
  }

  const { startDate: startdate, budgetLineItems: lineItems } = budget;

  const [hideWeeklyItems, setHideWeeklyItems] = useState(false);

  const currentBudgetLineItems = getWeeksBudgetLineItems(date, startdate, lineItems);
  const friday = getFriday(date);
  const weekStartingBalance = getWeekStartingBalance();

  const balanceAfterItem = (i: number): number | null => {
    if (weekStartingBalance) {
      let _balanceAfterItem: number = weekStartingBalance;
      let j = i;

      // Tally balance.
      while (j >= 0) {
        const _item = currentBudgetLineItems[j];
        // const verifiedAmount = getVerifiedAmt( _item.item, friday.add( _item.days, 'day' ));
        const verifiedAmount = getVerificationOn( friday.add( _item.days, 'day' ), _item.item );
        _balanceAfterItem += (verifiedAmount ?? _item.item.amount) * (_item.item.type === "expense" ? -1 : 1);
        j--;
      }
      return _balanceAfterItem;
    }
    return null;
  }

  const endingBalance: number | null = balanceAfterItem(currentBudgetLineItems.length - 1);

  return (
    // print line items for this week in order.

    <div className="col-lg-6 x25-line-item-list">
      <div className="card card-flush h-lg-100">
        <div className="card-header mt-6">
          <div className="card-title flex-column">
            <h3 className="fw-bold mb-1">This Week</h3>
            {/* <div className="fs-6 text-gray-400">{currentBudgetLineItems.length} Budget Items</div> */}
          </div>
          <div className="card-toolbar">
            <a href="#" className="btn btn-bg-light btn-active-color-primary btn-sm">View All</a>
          </div>
        </div>

        <div className="d-flex flex-wrap px-6 py-2">
          <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
            <div className="d-flex align-items-center">
              <div className="fs-2 fw-bold counted">{currentBudgetLineItems.length}</div>
            </div>
            <div className="fw-semibold fs-6 text-gray-400">Budget Item{currentBudgetLineItems.length > 1 && <span>s</span>}</div>
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

        <div className="card-body d-flex flex-column mb-9 px-6 py-3">
          {weekStartingBalance && currentBudgetLineItems.map((item, i) => {
            const endingBalance = balanceAfterItem(i);
            const hasPassed: boolean = dayjs().isSameOrAfter(friday.add(item.days, 'day'));

            let isNewDay = i === 0 || item.days !== currentBudgetLineItems[i - 1].days
              ? friday.add(item.days, 'day').format('dddd, M/D')
              : null

            return (
              <React.Fragment key={i} >
                <WeeklyWidgetLineItem
                  item={item.item}
                  days={item.days}
                  isNewDay={isNewDay}
                  hideWeeklyItems={hideWeeklyItems}
                  endingBalance={endingBalance}
                  hasPassed={hasPassed}
                />
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
};