import React, { useContext, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

import { BudgetItem, BudgetItemFrequency } from "../utils/schemas";
import { Menu, MenuItem } from "./floating-menu";
import { Popup } from "./popups/popup";
import { MenuButton } from "./menu-button";
import { BudgetContext } from "../deprecated/budgetContext";
import { UpdateBudgetItem } from "./modals/update-budget-item-modal";

dayjs.extend(isSameOrAfter);

type BudgetItemCardProps = {
  item: BudgetItem,
  date: Dayjs,
  runningTotal: number | null
}

// TODO: 
//  - fix menu button not changing to blue on hover.
//  - have actions and filters run on apply button click.
//  - find a way to show error for errors with duplicate, delete functionailty
//  - be able to close menu after successful duplicate fn

export const BudgetItemCard: React.FC<BudgetItemCardProps> = (props) => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { budget, duplicateBudgetItem, deleteBudgetItem } = context;
  const { item, date, runningTotal } = props;
  const started = item.frequency !== BudgetItemFrequency.once && date.isSameOrAfter(item.starts);
  const ended = item.frequency !== BudgetItemFrequency.once && item.ends !== "-1" && date.isAfter(item.ends);

  const [toDelete, setToDelete] = useState<boolean>(false);
  const [toEdit, setToEdit] = useState<boolean>(false);

  return (
    <div className="col-12 col-lg-3">
      <div className="card mb-6 mb-xl-9">
        <div className="card-body p-6">
          <div className="d-flex flex-stack mb-3">
            {item.frequency === BudgetItemFrequency.weekly && <div className="badge badge-light-info">weekly</div>}
            <div></div>
            <div>
              <Menu label="" rootMenuButton={<MenuButton />}>
                <MenuItem label="Edit" onClick={() => setToEdit(true)} />
                <MenuItem label="Duplicate" onClick={() => duplicateBudgetItem(item)} />
                <MenuItem label="Delete" onClick={() => setToDelete(true)} />
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
                // a += _date.toString();
                a += _date;
                if (["1", "21", "31"].includes(_date)) { a += "st"; }
                else if (["2", "22"].includes(_date)) { a += "nd"; }
                else if (["3", "23"].includes(_date)) { a += "rd"; }
                else { a += "th"; }
                return a;
              })} of month</span>
            }

            {item.frequency !== BudgetItemFrequency.once &&
              <p className="my-2">
                {started ? "Began" : "Begins"}: {item.starts.format("MMM D, YYYY")}
                {item.ends !== "-1" && (ended ? ", Ended: " : ", Ends: ") + item.ends.format("MMM D, YYYY")}
              </p>
            }
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
      {toDelete &&
        <Popup
          item={item}
          onDeleteItem={(item) => {
            deleteBudgetItem(item);
            // if (budget) {
            //   const response = deleteBudgetItem(budget.id, item.id);
            //   if (response.status === "success") {
            //     setToDelete(false);
            //   } else {
            //     console.log(response.message);
            //   }
            // }
          }}
          onCancel={() => setToDelete(false)}
        />
      }
      {toEdit &&
        <UpdateBudgetItem mode="edit" onCancel={() => { setToEdit(false) }} currentItem={item} />
      }
    </div>
  )
};