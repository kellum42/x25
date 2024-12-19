import React from "react";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

import { BudgetItem, BudgetItemFrequency } from "../utils/schemas";
import { calculateBalance } from "../utils/budget";
import { Menu, MenuItem } from "./floating-menu";
import { defaultProps } from "react-select/dist/declarations/src/Select";

dayjs.extend(isSameOrAfter);

type BudgetItemCardProps = {
  item: BudgetItem,
  date: Dayjs,
  runningTotal: number | null,
  onDelete: (item: BudgetItem) => void
}

// TODO: 
//  - fix menu button not changing to blue on hover.
//  - have actions and filters run on apply button click.

export const BudgetItemCard: React.FC<BudgetItemCardProps> = (props) => {
  const { item, date, runningTotal, onDelete } = props;
  const started = item.frequency !== BudgetItemFrequency.once && date.isSameOrAfter(item.starts);
  const ended = item.frequency !== BudgetItemFrequency.once && item.ends !== "-1" && date.isAfter(item.ends);

  const MenuButton: React.FC = () => {
    return (
      <button type="button" className="btn btn-sm btn-icon btn-color-light-dark btn-active-light-primary" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">
        <span className="svg-icon svg-icon-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
            <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <rect x="5" y="5" width="5" height="5" rx="1" fill="currentColor"></rect>
              <rect x="14" y="5" width="5" height="5" rx="1" fill="currentColor" opacity="0.3"></rect>
              <rect x="5" y="14" width="5" height="5" rx="1" fill="currentColor" opacity="0.3"></rect>
              <rect x="14" y="14" width="5" height="5" rx="1" fill="currentColor" opacity="0.3"></rect>
            </g>
          </svg>
        </span>
      </button>
    )
  };

  return (
    <div className="col-12 col-lg-3">
      <div className="card mb-6 mb-xl-9">
        <div className="card-body p-6">
          <div className="d-flex flex-stack mb-3">
            {item.frequency === BudgetItemFrequency.weekly && <div className="badge badge-light-info">weekly</div>}
            <div></div>
            <div>
              <Menu label="" rootMenuButton={<MenuButton />}>
                <MenuItem label="Edit" />
                <MenuItem label="Duplicate" />
                <MenuItem label="Delete" onClick={() => onDelete(item)} />
              </Menu>
            </div>
          </div>
          <div className="mb-2">
            <a href="#" className="fs-4 fw-bold mb-1 text-gray-900 text-hover-primary">{item.name}</a>
          </div>
          <div className="fs-7 fw-semibold text-gray-600 mb-5">
            {item.frequency === BudgetItemFrequency.weekly && <span>Every {item.day}</span>}
            {item.frequency === BudgetItemFrequency.biweekly && <span>Every other {item.day}</span>}
            {item.frequency === BudgetItemFrequency.once && <span>One-time on {item.date.format("MMM D, YYYY")}</span>}
            {item.frequency === BudgetItemFrequency.monthly && <span>{item.dates.map(
              (_date, i) => {
                let a: string = "";
                if (i !== 0) { a += ", "; }
                a += _date.toString();
                if (["1", "21", "31"].includes(_date)) { a += "st"; }
                else if (["2", "22"].includes(_date)) { a += "nd"; }
                else if (["3", "23"].includes(_date)) { a += "rd"; }
                else { a += "th"; }
                return a;
              })} of month</span>
            }

            {item.frequency !== BudgetItemFrequency.once && <p className="my-2">
              {started ? "Began" : "Begins"}: {item.starts.format("MMM D, YYYY")}
              {item.ends !== "-1" && (ended ? ", Ended: " : ", Ends: ") + item.ends.format("MMM D, YYYY")}
            </p>}
          </div>
          <div className="d-flex flex-stack flex-wrapr">
            <div className="d-flex my-1">
              {typeof runningTotal === "number" &&
                <div className="border border-dashed border-gray-300 rounded py-2 px-3">
                  <span className="ms-1 fs-7 fw-bold text-gray-600">${Math.abs(runningTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })} YTD</span>
                </div>
              }
            </div>
            <div className={"fs-3 fw-bold " + (item.type === "income" ? "text-success" : "")}>
              {item.type === "income" && <span>+</span>}
              ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};