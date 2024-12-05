import React, { SetStateAction, useContext, useEffect, useState } from "react"
import { Dayjs } from "dayjs";

import { DateChanger } from "./datechanger";
import { BudgetLineItem, BudgetLineItemFrequency } from "../hooks/useBudgetDetails";
import { calculateBalance, getUpcomingBudgetItems, itemIsActive, ytd } from "../utils/budget";
import { BudgetContext } from "../contexts/budgetContext";
import { numberOrNull } from "../utils/util";
import { Menu, MenuItem } from "./floating-menu";
import { BudgetItemFilterMenu } from "./budget-item-filter-menu";

// TODO:
//  - Search functionality

export enum BudgetItemSorts {
  PLtoH = "Price ↑",
  PHtoL = "Price ↓",
  YTDLtoH = "Price YTD ↑",
  YTDHtoL = "Price YTD ↓",
  upcoming = "Upcoming",
  farthest = "Farthest"
}
export type BudgetItemFilters = {
  frequency: BudgetLineItemFrequency[],
  state: "active" | "inactive" | null
}

type BudgetItemQueryProps = {
  setQuery: React.Dispatch<SetStateAction<(items: BudgetLineItem[]) => BudgetLineItem[]>>
}

export const BudgetItemQuery: React.FC<BudgetItemQueryProps> = (props) => {

  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { budget, date } = context;

  const defaults: { sort: BudgetItemSorts, filters: BudgetItemFilters } = {
    sort: BudgetItemSorts.PHtoL,
    filters: { 
      frequency: [
        BudgetLineItemFrequency.Once, 
        BudgetLineItemFrequency.Weekly, 
        BudgetLineItemFrequency.Monthly, 
        BudgetLineItemFrequency.Biweekly
      ], 
      state: null 
    }
  }

  const [sort, setSort] = useState<BudgetItemSorts>(defaults.sort);
  const [filters, setFilters] = useState<BudgetItemFilters>(defaults.filters);

  const sortItems = (items: BudgetLineItem[]): BudgetLineItem[] => {
    let _items: BudgetLineItem[] = [];

    if (budget !== null) {
      if (sort === BudgetItemSorts.upcoming || sort === BudgetItemSorts.farthest) {
        _items = getUpcomingBudgetItems(date, -1, items, sort === BudgetItemSorts.upcoming ? "asc" : "desc").map((_item) => _item.item);

      } else if (sort === BudgetItemSorts.YTDHtoL || sort === BudgetItemSorts.YTDLtoH) {
        _items = items.sort((a, b) => {
          const aYTD = ytd(date, budget.startDate, a) ?? 0;
          const bYTD = ytd(date, budget.startDate, b) ?? 0;
          return (Math.abs(aYTD) - Math.abs(bYTD)) * (sort === BudgetItemSorts.YTDLtoH ? 1 : -1);
        });

      } else {
        _items = items.sort((a, b) => (a.amount - b.amount) * (sort === BudgetItemSorts.PLtoH ? 1 : -1))
      }
    }
    return _items;
  }

  const filterItems = (items: BudgetLineItem[]): BudgetLineItem[] => {
    return items.filter((item) => {
      if (budget !== null) {
        let willShow = true;

        willShow = filters.frequency.includes(item.frequency);

        if (willShow) {
          willShow = filters.state === null || (filters.state === "active" ? itemIsActive(date, budget.startDate, item) : !itemIsActive(date, budget.startDate, item));
        }

        return willShow;
      } else {
        return false;
      }
    })
  }

  useEffect(() => {
    const fn = () => (items: BudgetLineItem[]): BudgetLineItem[] => {
      let _items = items;
      _items = filterItems(_items);
      _items = sortItems(_items);
      return _items;
    };
    props.setQuery(fn);

  }, [sort, filters, date]);

  return (
    <div>
      <div className="card p-4">
        <div className="card-header border-0 p-0">
          <div className="card-title">
            <div className="d-flex align-items-center position-relative my-1 me-3">
              <span className="svg-icon svg-icon-1 position-absolute ms-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect opacity="0.5" x="17.0365" y="15.1223" width="8.15546" height="2" rx="1" transform="rotate(45 17.0365 15.1223)" fill="currentColor"></rect>
                  <path d="M11 19C6.55556 19 3 15.4444 3 11C3 6.55556 6.55556 3 11 3C15.4444 3 19 6.55556 19 11C19 15.4444 15.4444 19 11 19ZM11 5C7.53333 5 5 7.53333 5 11C5 14.4667 7.53333 17 11 17C14.4667 17 17 14.4667 17 11C17 7.53333 14.4667 5 11 5Z" fill="currentColor"></path>
                </svg>
              </span>
              <input type="text" data-kt-customer-table-filter="search" className="form-control form-control-solid w-250px ps-15" placeholder="Search Budget Items" />
            </div>
            <DateChanger />
          </div>
          <div className="card-toolbar">
            <div className="d-flex justify-content-end" data-kt-customer-table-toolbar="base">
            <Menu label="" rootMenuButton={(
              <button type="button" className="btn btn-light-primary me-3" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">
              <span className="svg-icon svg-icon-2">
                <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect y="6" width="16" height="3" rx="1.5" fill="currentColor" />
                  <rect opacity="0.3" y="12" width="8" height="3" rx="1.5" fill="currentColor" />
                  <rect opacity="0.3" width="12" height="3" rx="1.5" fill="currentColor" />
                </svg>
              </span>
              Sort
            </button>
            )}>
                { Object.keys( BudgetItemSorts ).map( key => {
                  const _sort = BudgetItemSorts[key as keyof typeof BudgetItemSorts]
                  return <MenuItem label={_sort} isHighlighted={ sort === _sort } onClick={() => setSort( _sort )} />
                })}
            </Menu>
              
              <BudgetItemFilterMenu filters={filters} setFilters={setFilters} default={defaults.filters} />
              <div className="d-none menu menu-sub menu-sub-dropdown w-300px w-md-325px" data-kt-menu="true" id="kt-toolbar-filter"></div>
              <button type="button" className="btn btn-light-primary me-3" data-bs-toggle="modal" data-bs-target="#kt_customers_export_modal">
                <span className="svg-icon svg-icon-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.4 13.9411L10.7 5.24112C10.4 4.94112 10 4.84104 9.60001 5.04104C9.20001 5.24104 9 5.54107 9 5.94107V18.2411C9 18.6411 9.20001 18.941 9.60001 19.141C9.70001 19.241 9.9 19.2411 10 19.2411C10.2 19.2411 10.4 19.141 10.6 19.041C11.4 18.441 12.1 17.941 12.9 17.541L14.4 21.041C14.6 21.641 15.2 21.9411 15.8 21.9411C16 21.9411 16.2 21.9411 16.4 21.8411C17.2 21.5411 17.5 20.6411 17.2 19.8411L15.7 16.2411C16.7 15.9411 17.7 15.741 18.8 15.541C19.2 15.541 19.5 15.2411 19.6 14.8411C19.8 14.6411 19.7 14.2411 19.4 13.9411Z" fill="currentColor" />
                    <path opacity="0.3" d="M15 6.941C14.8 6.941 14.7 6.94102 14.6 6.84102C14.1 6.64102 13.9 6.04097 14.2 5.54097L15.2 3.54097C15.4 3.04097 16 2.84095 16.5 3.14095C17 3.34095 17.2 3.941 16.9 4.441L15.9 6.441C15.7 6.741 15.4 6.941 15 6.941ZM18.4 9.84102L20.4 8.84102C20.9 8.64102 21.1 8.04097 20.8 7.54097C20.6 7.04097 20 6.84095 19.5 7.14095L17.5 8.14095C17 8.34095 16.8 8.941 17.1 9.441C17.3 9.841 17.6 10.041 18 10.041C18.2 9.94097 18.3 9.94102 18.4 9.84102ZM7.10001 10.941C7.10001 10.341 6.70001 9.941 6.10001 9.941H4C3.4 9.941 3 10.341 3 10.941C3 11.541 3.4 11.941 4 11.941H6.10001C6.70001 11.941 7.10001 11.541 7.10001 10.941ZM4.89999 17.1409L6.89999 16.1409C7.39999 15.9409 7.59999 15.341 7.29999 14.841C7.09999 14.341 6.5 14.141 6 14.441L4 15.441C3.5 15.641 3.30001 16.241 3.60001 16.741C3.80001 17.141 4.1 17.341 4.5 17.341C4.6 17.241 4.79999 17.2409 4.89999 17.1409Z" fill="currentColor" />
                  </svg>

                </span>
                Select
              </button>
            </div>
            <div className="d-flex justify-content-end align-items-center d-none" data-kt-customer-table-toolbar="selected">
              <div className="fw-bold me-5">
                <span className="me-2" data-kt-customer-table-select="selected_count"></span>Selected</div>
              <button type="button" className="btn btn-danger" data-kt-customer-table-select="delete_selected">Delete Selected</button>
            </div>
          </div>
        </div>
      </div>
      {budget &&
        <p className="fs-5 fw-semibold mt-6 mb-4">{budget.budgetLineItems.length} Budget Items
          <span className="text-gray-600 ps-4">by {sort}</span>
        </p>
      }
    </div>
  );
}