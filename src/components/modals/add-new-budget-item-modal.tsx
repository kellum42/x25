import React, { SetStateAction, useContext } from "react"
import Select from "react-select";
import DatePicker from "react-datepicker";

import { Modal } from "./modal";
import dayjs from "dayjs";
import { useNewBudgetItem } from "../../hooks/useNewBudgetItem";
import { BudgetContext } from "../../contexts/budgetContext";
import { BudgetItemFrequency, WeekDays } from "../../utils/schemas";


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

type FormDatePickerProps = {
  name: string,
  value?: string,
  onUpdate: (name: string, value?: string) => void
}
const FormDatePicker: React.FC<FormDatePickerProps> = (props) => {
  const dateFormat = "MMM DD, YYYY";
  const onChange = (date: Date | null, event: any) => {
    if (date) {
      props.onUpdate(props.name, dayjs(date).format(dateFormat));
    }
  }
  return (
    <DatePicker
      selected={dayjs().toDate()}
      onChange={onChange}
      wrapperClassName="d-block"
      customInput={(
        <div className="position-relative d-flex align-items-center">
          <span className="svg-icon svg-icon-2 position-absolute mx-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path opacity="0.3" d="M21 22H3C2.4 22 2 21.6 2 21V5C2 4.4 2.4 4 3 4H21C21.6 4 22 4.4 22 5V21C22 21.6 21.6 22 21 22Z" fill="currentColor"></path>
              <path d="M6 6C5.4 6 5 5.6 5 5V3C5 2.4 5.4 2 6 2C6.6 2 7 2.4 7 3V5C7 5.6 6.6 6 6 6ZM11 5V3C11 2.4 10.6 2 10 2C9.4 2 9 2.4 9 3V5C9 5.6 9.4 6 10 6C10.6 6 11 5.6 11 5ZM15 5V3C15 2.4 14.6 2 14 2C13.4 2 13 2.4 13 3V5C13 5.6 13.4 6 14 6C14.6 6 15 5.6 15 5ZM19 5V3C19 2.4 18.6 2 18 2C17.4 2 17 2.4 17 3V5C17 5.6 17.4 6 18 6C18.6 6 19 5.6 19 5Z" fill="currentColor"></path>
              <path d="M8.8 13.1C9.2 13.1 9.5 13 9.7 12.8C9.9 12.6 10.1 12.3 10.1 11.9C10.1 11.6 10 11.3 9.8 11.1C9.6 10.9 9.3 10.8 9 10.8C8.8 10.8 8.59999 10.8 8.39999 10.9C8.19999 11 8.1 11.1 8 11.2C7.9 11.3 7.8 11.4 7.7 11.6C7.6 11.8 7.5 11.9 7.5 12.1C7.5 12.2 7.4 12.2 7.3 12.3C7.2 12.4 7.09999 12.4 6.89999 12.4C6.69999 12.4 6.6 12.3 6.5 12.2C6.4 12.1 6.3 11.9 6.3 11.7C6.3 11.5 6.4 11.3 6.5 11.1C6.6 10.9 6.8 10.7 7 10.5C7.2 10.3 7.49999 10.1 7.89999 10C8.29999 9.90003 8.60001 9.80003 9.10001 9.80003C9.50001 9.80003 9.80001 9.90003 10.1 10C10.4 10.1 10.7 10.3 10.9 10.4C11.1 10.5 11.3 10.8 11.4 11.1C11.5 11.4 11.6 11.6 11.6 11.9C11.6 12.3 11.5 12.6 11.3 12.9C11.1 13.2 10.9 13.5 10.6 13.7C10.9 13.9 11.2 14.1 11.4 14.3C11.6 14.5 11.8 14.7 11.9 15C12 15.3 12.1 15.5 12.1 15.8C12.1 16.2 12 16.5 11.9 16.8C11.8 17.1 11.5 17.4 11.3 17.7C11.1 18 10.7 18.2 10.3 18.3C9.9 18.4 9.5 18.5 9 18.5C8.5 18.5 8.1 18.4 7.7 18.2C7.3 18 7 17.8 6.8 17.6C6.6 17.4 6.4 17.1 6.3 16.8C6.2 16.5 6.10001 16.3 6.10001 16.1C6.10001 15.9 6.2 15.7 6.3 15.6C6.4 15.5 6.6 15.4 6.8 15.4C6.9 15.4 7.00001 15.4 7.10001 15.5C7.20001 15.6 7.3 15.6 7.3 15.7C7.5 16.2 7.7 16.6 8 16.9C8.3 17.2 8.6 17.3 9 17.3C9.2 17.3 9.5 17.2 9.7 17.1C9.9 17 10.1 16.8 10.3 16.6C10.5 16.4 10.5 16.1 10.5 15.8C10.5 15.3 10.4 15 10.1 14.7C9.80001 14.4 9.50001 14.3 9.10001 14.3C9.00001 14.3 8.9 14.3 8.7 14.3C8.5 14.3 8.39999 14.3 8.39999 14.3C8.19999 14.3 7.99999 14.2 7.89999 14.1C7.79999 14 7.7 13.8 7.7 13.7C7.7 13.5 7.79999 13.4 7.89999 13.2C7.99999 13 8.2 13 8.5 13H8.8V13.1ZM15.3 17.5V12.2C14.3 13 13.6 13.3 13.3 13.3C13.1 13.3 13 13.2 12.9 13.1C12.8 13 12.7 12.8 12.7 12.6C12.7 12.4 12.8 12.3 12.9 12.2C13 12.1 13.2 12 13.6 11.8C14.1 11.6 14.5 11.3 14.7 11.1C14.9 10.9 15.2 10.6 15.5 10.3C15.8 10 15.9 9.80003 15.9 9.70003C15.9 9.60003 16.1 9.60004 16.3 9.60004C16.5 9.60004 16.7 9.70003 16.8 9.80003C16.9 9.90003 17 10.2 17 10.5V17.2C17 18 16.7 18.4 16.2 18.4C16 18.4 15.8 18.3 15.6 18.2C15.4 18.1 15.3 17.8 15.3 17.5Z" fill="currentColor"></path>
            </svg>
          </span>
          <input
            value={props.value ? dayjs(props.value).format(dateFormat) : ""}
            className="form-control form-control-solid ps-12 flatpickr-input active"
            placeholder="Select a date"
            type="text"
            readOnly={true}
          />
        </div>
      )}
    />
  )
};

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