import React, { useContext } from "react"
import Select from "react-select";

import { Modal } from "./modal";
import dayjs from "dayjs";
import { useUpdateBudgetItem } from "../../hooks/useUpdateBudgetItem";
import { BudgetContext } from "../../contexts/budgetContext";
import { BudgetItem, BudgetItemFrequency, WeekDays } from "../../utils/schemas";
import { FormDatePicker } from "../form-datepicker";
import { budgetItemToRecord } from "../../utils/budget";


// TODO: 
//  - Finish form validation
//  - Make "starts" date range for datepicker begin on budget start date.
//  - When item start date is set to date in past, show message budget will reflect this item charges.

type UpdateBudgetItemProps = {
  onCancel: () => void,
  mode: "create" | "edit",
  currentItem?: BudgetItem
}

export const UpdateBudgetItem: React.FC<UpdateBudgetItemProps> = (props) => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }



  const { mode, onCancel, currentItem } = props;
  const { fields, screen, next, back, update, error, save } = useUpdateBudgetItem(
    mode === "edit" && currentItem ?
      budgetItemToRecord(currentItem) :
      { "type": "expense", "ends": "-1", "day": "Friday", "dates": "1", "frequency": BudgetItemFrequency.once }
  );

  const screens = [
    {
      title: (mode === "create" ? "Create New" : "Edit") + " Budget Item",
      action: {
        label: "Next",
        cancel: "Cancel",
        actionFn: () => { next() }
      }
    },
    {
      title: (mode === "create" ? "Create New" : "Edit") + " Budget Item (cont'd)",
      action: {
        label: "Finish",
        cancel: "Back",
        actionFn: () => {
          const success = save();
          if (success) {
            onCancel();
          }
        },
        cancelFn: () => back()
      },
      error
    }
  ];

  const currentScreen = screens[screen];

  return (
    <Modal
      title={currentScreen.title}
      isOpen={true}
      setIsOpen={onCancel}
      action={currentScreen.action}
      error={currentScreen.error}
    >
      {screen === 0 &&
        <GeneralScreen
          fields={fields}
          update={update}
        />
      }
      {screen === 1 &&
        <FrequencyScreen
          fields={fields}
          update={update}
        />
      }
    </Modal>
  )
}

type GeneralScreenProps = {
  fields: Record<string, string | undefined>,
  update: (name: string, value?: string) => void
}

const GeneralScreen: React.FC<GeneralScreenProps> = (props) => {
  const { fields, update } = props;
  const type = fields.type ?? "";

  return (
    <div>
      <div className="mb-5 fv-row fv-plugins-icon-container">
        <label className="required fs-5 fw-semibold mb-2">Name</label>
        <input type="text" onChange={(e) => update("name", e.target.value)} value={fields.name ?? ""} className="form-control form-control-solid" placeholder="Name" name="name" />
        <div className="fv-plugins-message-container invalid-feedback"></div>
      </div>
      <div className="mb-5 fv-plugins-icon-container">
        <label className="required fs-5 fw-semibold mb-2">Amount</label>
        <input type="number" onChange={(e) => update("amount", e.target.value)} value={fields.amount ?? ""} className="form-control form-control-solid" placeholder="Amount" name="amount" />
        <div className="fv-plugins-message-container invalid-feedback"></div>
      </div>
      <div className="mb-5 cfv-plugins-icon-container">
        <label className="required fs-5 fw-semibold mb-2">Type</label>
        <div>
          <div className="btn-group w-250px">
            <label className={"btn btn-outline btn-active-success btn-color-muted" + (type === "income" ? " active" : "")}>
              <input className="btn-check" name="type" type="radio" value="income" checked={type === "income"} onChange={(e) => update("type", e.target.value)} />
              Income</label>
            <label className={"btn btn-outline btn-active-success btn-color-muted" + (type === "expense" ? " active" : "")}>
              <input className="btn-check" name="type" type="radio" checked={type === "expense"} value="expense" onChange={(e) => update("type", e.target.value)} />
              Expense</label>
          </div>
        </div>
        <div className="fv-plugins-message-container invalid-feedback"></div>
      </div>
    </div>
  )
}

type FrequencyScreenProps = {
  fields: Record<string, string | undefined>,
  update: (name: string, value?: string) => void
}

const FrequencyScreen: React.FC<FrequencyScreenProps> = (props) => {
  const { update, fields } = props;

  const frequency = fields.frequency ?? "";
  const date = fields.date ?? "";
  const starts = fields.starts ?? "";
  const ends = fields.ends ?? "";
  const day = fields.day ?? "Friday";

  const dateFormat = "YYYY-MM-DD";
  const isWeekly = frequency === BudgetItemFrequency.weekly || frequency === BudgetItemFrequency.biweekly;

  const prettyDate = (_date: string|number): string => {
    const date = typeof _date === "number" ? _date.toString() : _date;
    const suffix = ["1", "21", "31"].includes(date) ?
      "st" :
      ["2", "22"].includes(date) ?
        "nd" :
        ["3", "23"].includes(date) ?
          "rd" :
          "th"
      ;
    return date + suffix;
  }

  return (
    <div>
      <div className="mb-5 fv-row fv-plugins-icon-container">
        <label className="required fs-5 fw-semibold mb-2">Frequency</label>
        <p className="fs-7 fw-semibold text-muted">How often will this item occur?</p>
        <Select
          defaultValue={
            "frequency" in fields ?
              { label: frequency, value: frequency } :
              { label: "Once", value: "Once" }
          }
          options={
            Object.keys(BudgetItemFrequency).map(
              key => ({
                value: BudgetItemFrequency[key as keyof typeof BudgetItemFrequency],
                label: BudgetItemFrequency[key as keyof typeof BudgetItemFrequency]
              })
            )
          }
          onChange={(newValue) => update("frequency", newValue?.value)}
        />
      </div>
      {frequency === "Once" &&
        <div className="mb-5 fv-row fv-plugins-icon-container">
          <label className="required fs-6 fw-semibold mb-2">Due Date</label>
          <div>
            <FormDatePicker
              name="date"
              value={date}
              onUpdate={(name, value) => update(name, value)}
            />
          </div>
        </div>
      }

      {frequency !== "Once" &&
        <>
          <div className="row mb-5 align-items-end">
            {frequency === "Monthly" &&
              <div className="col-6">
                <label className="required fs-6 fw-semibold">Dates</label>
                <div className="fs-7 fw-semibold text-muted">What dates will this occur? (ex. 1st of month)</div>
                <Select
                  defaultValue={
                    "dates" in fields ?
                    fields.dates?.split(",").map( date => ({ label: prettyDate(date), value: date })) :
                    { label: "1st", value: "1" }
                  }
                isMulti
                options={
                  Array(31).fill(0).map((_, _i) => {
                    const i = _i + 1;
                    return { label: prettyDate(i), value: i.toString() }
                  })
                }
                onChange={(newValue) => update("dates", newValue.map(v => v.value).join(","))}
                />
              </div>
            }
            {isWeekly &&
              <div className="col-6">
                <label className="required fs-6 fw-semibold">Day</label>
                <div className="fs-7 fw-semibold text-muted">What day will this occur?</div>
                <Select
                  defaultValue={{ label: day, value: day }}
                  options={Object.values(WeekDays).map(v => ({ label: v, value: v }))}
                  onChange={(newValue) => update("day", newValue?.value)}
                />
              </div>
            }

            <div className="col-6 fv-plugins-icon-container">
              <label className="required fs-6 fw-semibold mb-2">Starting</label>
              <div>
                <FormDatePicker
                  name="starts"
                  value={starts}
                  onUpdate={(name, value) => update(name, value)}
                />
              </div>
            </div>
          </div>
          <div className="row mb-5">
            <div className="col-12 mb-8">
              <div className="d-flex flex-stack">
                <div className="me-5">
                  <label className="fs-6 fw-semibold">Is there an end date?</label>
                  <div className="fs-7 fw-semibold text-muted">Most budget items will not have an end date.</div>
                </div>
                <label className="form-check form-switch form-check-custom form-check-solid">
                  <input
                    onChange={(e) => update("ends", e.target.checked ? dayjs().format(dateFormat) : "-1")}
                    className="form-check-input"
                    type="checkbox" value="1"
                    checked={ends !== undefined && ends !== "-1"}
                  />
                  <span className="form-check-label fw-semibold text-muted">{ends === undefined || ends === "-1" ? "No" : "Yes"}</span>
                </label>
              </div>
            </div>
            <div className={"col-6 mb-5" + (ends === undefined || ends === "-1" ? " d-none" : "d-block")}>
              <label className="required fs-6 fw-semibold mb-2">End Date</label>
              <div>
                <FormDatePicker
                  name="ends"
                  value={ends}
                  onUpdate={(name, value) => update(name, value)}
                />
              </div>
            </div>
          </div>
        </>
      }
    </div>
  );
}