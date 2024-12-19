import React, { SetStateAction, useContext } from "react"
import Select from "react-select";
import DatePicker from "react-datepicker";

import { Modal } from "./modal";
import dayjs from "dayjs";
import { useNewBudgetItem } from "../../hooks/useNewBudgetItem";
import { BudgetContext } from "../../contexts/budgetContext";
import { BudgetItemFrequency, WeekDays } from "../../utils/schemas";
import { FormDatePicker } from "../form-datepicker";


// TODO: 
//  - Finish form validation
//  - Make "starts" date range for datepicker begin on budget start date.
//  - When item start date is set to date in past, show message budget will reflect this item charges.
//  - Store item frequency as "biweekly" vs "Bi-weekly" so label can be changed without messing up data.
//  - Screen ui resets when leaving screen, but value persists. Make ui persist as well.
//  - Takes a reload for new budget items to appear. Fix that.

type AddNewBudgetItemProps = {
  isOpen: boolean,
  setIsOpen: React.Dispatch<SetStateAction<boolean>>
}

export const AddNewBudgetItem: React.FC<AddNewBudgetItemProps> = (props) => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { isOpen, setIsOpen } = props;
  const { fields, screen, next, save, back, update, error } = useNewBudgetItem();

  const screens = [
    {
      title: "Add New Budget Item",
      action: {
        label: "Next",
        cancel: "Cancel",
        actionFn: () => { next() }
      }
    },
    {
      title: "Add New Budget Item (cont'd)",
      action: {
        label: "Finish",
        cancel: "Back",
        actionFn: () => { 
          if ( save( context.budget?.slug )){
            setIsOpen( false );
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
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      action={currentScreen.action}
      error={currentScreen.error}
    >
      {screen === 0 &&
        <GeneralScreen
          type={fields.type}
          update={update}
        />
      }
      {screen === 1 &&
        <FrequencyScreen
          date={fields.date}
          dates={fields.dates}
          day={fields.day}
          starts={fields.starts}
          ends={fields.ends}
          frequency={fields.frequency}
          back={back}
          save={save}
          update={update}
        />
      }
    </Modal>
  )
}

type GeneralScreenProps = {
  type: string,
  update: (name: string, value?: string) => void
}

const GeneralScreen: React.FC<GeneralScreenProps> = (props) => {
  const { type, update } = props;

  return (
    <div>
      <div className="mb-5 fv-row fv-plugins-icon-container">
        <label className="required fs-5 fw-semibold mb-2">Name</label>
        <input type="text" onChange={(e) => update("name", e.target.value)} className="form-control form-control-solid" placeholder="Name" name="name" />
        <div className="fv-plugins-message-container invalid-feedback"></div>
      </div>
      <div className="mb-5 fv-plugins-icon-container">
        <label className="required fs-5 fw-semibold mb-2">Amount</label>
        <input type="number" onChange={(e) => update("amount", e.target.value)} className="form-control form-control-solid" placeholder="Amount" name="amount" />
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
  day: string,
  date: string,
  dates: string,
  starts: string,
  ends: string,
  frequency: string,
  back: () => void,
  save: (slug?: string) => void,
  update: (name: string, value?: string) => void
}

const FrequencyScreen: React.FC<FrequencyScreenProps> = (props) => {
  const { update, frequency, date, starts, ends } = props;
  const dateFormat = "YYYY-MM-DD";
  const isWeekly = frequency === "Weekly" || frequency === "Biweekly";

  return (
    <div>
      <div className="mb-5 fv-row fv-plugins-icon-container">
        <label className="required fs-5 fw-semibold mb-2">Frequency</label>
        <p className="fs-7 fw-semibold text-muted">How often will this item occur?</p>
        <Select
          defaultValue={{ label: "Once", value: "Once" }}
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
                  defaultValue={{ label: "1st", value: "1" }}
                  isMulti
                  options={
                    Array(31).fill(0).map((_, _i) => {
                      const i = _i + 1;
                      const suffix = [1, 21, 31].includes(i) ?
                        "st" :
                        [2, 22].includes(i) ?
                          "nd" :
                          [3, 23].includes(i) ?
                            "rd" :
                            "th"
                        ;
                      return { label: i + suffix, value: i.toString() }
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
                  defaultValue={{ label: "Friday", value: "Friday" }}
                  options={
                    Object.keys(WeekDays).map(day => ({ label: day, value: day }))
                  }
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