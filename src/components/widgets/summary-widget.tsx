import React, { FC, useContext } from "react"
import { Link } from "gatsby"
import dayjs, { Dayjs } from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween';

import { BudgetContext } from "../../contexts/budgetContext";
import { calculateBalance, daysTillFirstOccurrence, getFriday, getVerificationOn, getVerificationsBetween, getUpcomingBudgetItems } from "../../utils/budget";
import { DateChanger } from "../datechanger";
// import { BudgetLineItemFrequency } from "../../hooks/useBudgetDetails";
import { BudgetItemFrequency } from "../../utils/schemas";

dayjs.extend(isBetween);

export const SummaryWidget: FC = () => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { date, budget } = context;

  if (!budget) {
    return <></>;
  }

  const balance = calculateBalance(budget.startDate, budget.startingBalance, budget.items, date);

  // Gets the verifications due this week.
  // Friday is the first day of the week.
  const getVersDue = (): number => {
    const friday = getFriday(date);
    const items = getUpcomingBudgetItems(friday, 7, budget.items)
    // const items = getWeeksBudgetLineItems(date, budget.startDate, budget.items);
    const idealVerCount = items.length;
    let actualVerCount = 0;
    items.forEach((_item, _) => {
      const ver = getVerificationOn(friday.add(_item.days, 'day'), _item.item);
      actualVerCount += ver === null ? 0 : 1;
    })
    return idealVerCount - actualVerCount;
  };

  const getPastDueVers = (): number => {
    let vers: number = 0;
    let expectedVers: number = 0;
    const start = date.subtract(3, 'month');
    const end = date;

    budget.items.forEach((item, _) => {
      if (item.frequency === BudgetItemFrequency.once) {
        if (item.date.isBetween(start, end, 'day', '[]')) {
          expectedVers++;
          vers += getVerificationOn(item.date, item) === null ? 0 : 1;
        }
      } else {
        const _start = start.isBefore(item.starts) ? start : item.starts;
        const _end = item.ends !== "-1" && item.ends.isBefore(end) ? item.ends : end;
        const _rangeInDays = _end.diff(_start, 'day');

        const i = item.frequency === BudgetItemFrequency.monthly ? item.dates.length : 1;
        for (let _i = 0; _i < i; _i++) {
          const _daysTillFirstOccurrence = daysTillFirstOccurrence(item, _start, _i);
          if (typeof _daysTillFirstOccurrence === 'string') { return; }

          const rangeInDays = _rangeInDays - _daysTillFirstOccurrence;
          if (rangeInDays < 0) { return; }
          const firstOccurrence = _start.add(_daysTillFirstOccurrence, 'day');

          const numOccurrences = item.frequency === BudgetItemFrequency.monthly
            ? _end.diff(firstOccurrence, 'month') + 1
            : Math.floor(rangeInDays / (item.frequency == BudgetItemFrequency.weekly ? 7 : 14)) + 1

          expectedVers += numOccurrences;
          const _vers = getVerificationsBetween([firstOccurrence, _end], item);
          vers += _vers ? _vers.length : 0;
        }
      }
    });
    return expectedVers - vers;
  };

  const pastDueVers = getPastDueVers();

  return (
    // <div className="row g-xxl-9">
    //   <div className="col-xxl-8">
    <div className="card mb-6">
      <div className="card-header p-10 pb-2">
        <div className="card-title d-block">
          <h3 className="m-0 text-gray-900">Summary</h3>
          <p className="text-gray-400 fw-semibold fs-6 mt-2">As of {date.format("MMM D, YYYY")}</p>
        </div>
        {/* <div className="card-toolbar">
              <ul className="nav nav-tabs nav-line-tabs nav-stretch border-transparent fs-5 fw-bold" id="kt_security_summary_tabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <a className="nav-link text-active-primary active" data-kt-countup-tabs="true" data-bs-toggle="tab" href="#kt_security_summary_tab_pane_hours" data-kt-initialized="1" aria-selected="true" role="tab">12 Hours</a>
                </li>
                <li className="nav-item" role="presentation">
                  <a className="nav-link text-active-primary" data-kt-countup-tabs="true" data-bs-toggle="tab" id="kt_security_summary_tab_day" href="#kt_security_summary_tab_pane_day" data-kt-initialized="1" aria-selected="false" role="tab" tabIndex={-1}>Day</a>
                </li>
                <li className="nav-item" role="presentation">
                  <a className="nav-link text-active-primary" data-kt-countup-tabs="true" data-bs-toggle="tab" id="kt_security_summary_tab_week" href="#kt_security_summary_tab_pane_week" data-kt-initialized="1" aria-selected="false" role="tab" tabIndex={-1}>Week</a>
                </li>
              </ul>
            </div> */}
        <div className="card-toolbar">
          <DateChanger />
        </div>
      </div>

      <div className="card-body pt-7 pb-0 px-0">
        {/* begin::Tab content */}
        <div className="tab-content">
          {/* begin::Tab panel */}
          <div className="tab-pane fade active show" id="kt_security_summary_tab_pane_hours" role="tabpanel">
            {/* begin::Row */}
            <div className="row p-0 mb-5 px-9">
              {/* begin::Col */}
              {typeof balance === 'number' &&
                <div className="col p-2">
                  <div className="border border-dashed border-gray-300 text-center min-w-125px rounded pt-4 pb-2 my-3">
                    <span className="fs-6 fw-semibold text-success d-block">Current Balance</span>
                    <span className="fs-2hx fw-bold text-gray-900 counted">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              }
              {/* end::Col */}
              {/* begin::Col */}
              <div className="col p-2">
                <div className="border border-dashed border-gray-300 text-center min-w-125px rounded pt-4 pb-2 my-3">
                  <span className="fs-6 fw-semibold text-warning d-block">Verifications Due</span>
                  <span className="fs-2hx fw-bold text-gray-900 counted">{getVersDue()}</span>
                </div>
              </div>
              {/* end::Col */}
              {/* begin::Col */}
              <div className="col p-2">
                <div className="border border-dashed border-gray-300 text-center min-w-125px rounded pt-4 pb-2 my-3">
                  <span className="fs-6 fw-semibold text-danger d-block">Past Due Verifications</span>
                  <span className="fs-2hx fw-bold text-gray-900 counted">{pastDueVers > 100 ? "100+" : pastDueVers}</span>
                </div>
              </div>
              {/* end::Col */}
            </div>
            {/* end::Row */}
          </div>
        </div>
        {/* end::Tab content */}
      </div>

      <div className="px-10 fw-semibold">
        <div className="fs-6 d-flex justify-content-between mb-4">
          <div className="">Start Date</div>
          <div className="d-flex">{ budget.startDate.format( "MMM D, YYYY" )}</div>
        </div>
        <div className="separator separator-dashed"></div>

        <div className="fs-6 d-flex justify-content-between my-4">
          <div className="">Starting Balance</div>
          <div className="d-flex">${ budget.startingBalance.toLocaleString( undefined, { minimumFractionDigits: 2 }) }</div>
        </div>
        <div className="separator separator-dashed"></div>

        <div className="fs-6 d-flex justify-content-between my-4">
          <Link to={`/budget/${budget.slug}/items`} className="hover text-primary">Budget Items</Link>
          <div className="d-flex">{ budget.items.length }</div>
        </div>
        <div className="separator separator-dashed"></div>

        <div className="fs-6 d-flex justify-content-between my-4">
          <Link to={`/budget/${budget.slug}#sims`} className="hover text-primary">Simulations</Link>
          <div className="d-flex">0</div>
        </div>
      </div>
    </div>
  );
};