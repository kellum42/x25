import React, { FC } from "react"
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

import { BudgetLineItem, BudgetLineItemFrequency } from "../hooks/useBudgetDetails";
import { getThisWeeksBudgetLineItems, calculateBalance } from "../utils/budget";

import "../styles/budget-item-list.css"
import { getTheme } from "../utils/theme";

dayjs.extend(isSameOrAfter);

type BudgetDetailsLineItemListProps = {
  date: Dayjs,
  lineItems: BudgetLineItem[],
  weekStartingBalance: number | null
}

export const BudgetDetailsLineItemList: FC<BudgetDetailsLineItemListProps> = (props) => {
  const { date, lineItems, weekStartingBalance } = props;

  const currentBudgetLineItems = getThisWeeksBudgetLineItems(date, lineItems);
  const theme = getTheme( "light" );

  return (
    // print line items for this week in order.

    <div className="col-lg-6 x25-line-item-list">
      <div className="card card-flush h-lg-100">
        <div className="card-header mt-6">
          <div className="card-title flex-column">
            <h3 className="fw-bold mb-1">This Week</h3>
            <div className="fs-6 text-gray-400">{ currentBudgetLineItems.length } Budget Items</div>
          </div>
          <div className="card-toolbar">
            <a href="#" className="btn btn-bg-light btn-active-color-primary btn-sm">View All</a>
          </div>
        </div>
        <div className="card-body d-flex flex-column mb-9 px-6 py-3">
          {weekStartingBalance && currentBudgetLineItems.map((item, i) => {
            let _balanceAfterItem: number = weekStartingBalance;
            let j = i;
            const hasPassed: boolean = dayjs().isSameOrAfter( date.add( item.days, 'day' ));

            while ( j >= 0 ){
              const _item = currentBudgetLineItems[j];
              _balanceAfterItem += _item.item.amount * ( _item.item.type === "expense" ? -1 : 1 );
              j--;
            }

            let newDay = i === 0 || item.days !== currentBudgetLineItems[i - 1].days 
            ? date.add( item.days, 'day' ).format( 'dddd, M/D')
            : null
            
            return (
              <div key={i} className="line-item d-flex align-items-center position-relative p-3 mb-5 bg-hover-light">
                { newDay && <div>{ newDay }</div> }
                <div className="position-absolute top-0 start-0 rounded h-100 bg-secondary w-4px"></div>
                <div className="line-item-info fw-semibold">
                  <div className="line-item-checkbox form-check form-check-custom form-check-solid mx-3">
                    <input className="form-check-input" type="checkbox" value="" disabled checked={ hasPassed } />
                  </div>
                  <div className="line-item-title ms-2">
                    <div className="fs-6 fw-bold text-gray-900 mb-1">{ item.item.name }</div>
                    <div className="line-item-badges">
                      { item.item.frequency === BudgetLineItemFrequency.Weekly && 
                      <span className="badge badge-light-warning fw-bold">weekly</span>
                      }
                      <div className="fs-8"><a href="#">Duplicate</a></div>
                    </div>
                  </div>
                </div>
                <div className="line-item-numbers">
                  <div className="text-gray-900 text-end">
                    <div 
                      style={{ color: item.item.type === "income" ? theme.success : "inherit" }}
                      className="fs-5 fw-bold"
                    >
                      { item.item.type === "income" && <span>+</span>}
                      ${ item.item.amount.toLocaleString( 'en-US', { maximumFractionDigits:2 }) }
                    </div>
                    <div className="text-gray-400 running-balance fs-7">${ _balanceAfterItem.toLocaleString( 'en-US', { maximumFractionDigits:2 })}</div>
                  </div>
                  <div className="px-4">
                    <span className="text-gray-400 fc-icon fc-icon-chevron-right"></span>
                  </div>
                </div>
              </div>
            )
          })}

        </div>
      </div>
    </div>
  )
};