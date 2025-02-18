import React, { FC, useState } from "react"

import { BudgetItem } from "../utils/schemas"
import dayjs, { Dayjs } from "dayjs"
import { Occurrence } from "../hooks/useBudget"
import { getTheme } from "../utils/theme"

type OccurrenceCardProps = {
  date: Dayjs,
  occurrence: Occurrence,
  isNewDay: boolean,
  balance: number | null,
}

export const OccurrenceCard: FC<OccurrenceCardProps> = (props) => {
  const { isNewDay, occurrence, balance, date } = props;

  const theme = getTheme("light");
  const hasPassed = !occurrence.date.isBefore(date);
  const { item, verification } = occurrence;
  const isVerified = verification && verification.amount !== undefined;

  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [newVerification, setNewVerification] = useState<string>(
    item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })
  );
  const [loading, setIsLoading] = useState(false);

  const onVerifiedCheckboxChange = (wasChecked: boolean) => {
    console.log("checkbox is checked: %s", wasChecked);
  }

  const maybeVerify = () => {
    console.log("maybe verify...")
  }

  return (
    // <div className="line-item-wrapper">
    <div>
      {isNewDay && <div className="newday mt-6 text-center fs-6 text-gray-400 fw-bold py-2">{occurrence.date.format("dddd, M/D")}</div>}
      <div className={`line-item px-1 py-4 position-relative ${hasPassed ? 'bg-gray-100' : ''}`}>
        <div className="d-flex justify-content-between flex-row align-items-center px-4">
          <div className={"line-item-info fw-semibold d-flex flex-row " + (isVerifying ? "show" : "")}>
            <div className="me-2 rotate-90">
              <span
                onClick={() => {setIsVerifying(!isVerifying)}}
                className="text-gray-400 fc-icon cursor-pointer fc-icon-chevron-right">
              </span>
            </div>
            <div className="line-item-checkbox form-check form-check-custom form-check-solid mx-3">
              <input
                className="form-check-input cursor-pointer"
                type="checkbox"
                value=""
                checked={isVerified}
                onChange={(evt) => onVerifiedCheckboxChange(!evt.target.checked)}
              />
            </div>
            <div className="line-item-title ms-2 d-flex flex-row flex-wrap">
              <div className="fs-6 fw-bold text-gray-900 mb-1">{item.name}</div>
              {item.frequency === "Weekly" &&
                <div><span className="badge badge-light-info fw-bold mx-2">weekly</span></div>
              }
            </div>
          </div>
          <div className="line-item-numbers d-flex flex-row align-items-center">
            <div className="text-gray-900 text-end">
              {verification && verification.amount && verification.amount != item.amount ?
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
                    ${verification.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
              {balance && <div className="text-gray-400 running-balance fs-7">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>}
            </div>
          </div>
        </div>
        {/* collapsable menu */}
        {isVerifying &&
          <div className="py-4 d-flex flex-row">
            <div className="me-4">
              <input
                type="text"
                className="form-control form-control-solid py-2"
                value={newVerification}
                onChange={(e) => { setNewVerification(e.target.value)}}
                disabled={isVerified}
              ></input>
            </div>
            <button
              type="submit"
              className="btn btn-primary fs-8 py-0 px-6 min-w-100px"
              data-kt-indicator={loading ? "on" : "off"}
              onClick={() => maybeVerify()}
              disabled={isVerified}
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