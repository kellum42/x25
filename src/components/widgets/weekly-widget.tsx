import React, { FC, useContext, useEffect, useState } from "react"
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

import "../../styles/weekly-widget.css"
import { getTheme } from "../../utils/theme";
import { BudgetContext } from "../../contexts/budgetContext";
import { Occurrence } from "../../hooks/useOccurrences";
import { Schema } from "../../utils/types";
import { x25log } from "../../utils/log";

dayjs.extend(isSameOrAfter);


type WeeklyWidgetLineItemProps = {
  occ: Occurrence,
  isNewDay: string | null,
  onVerify: (item: string, date: Dayjs, amount: number) => Promise<boolean>
  onUnverify: (verification: Schema<"verification">) => Promise<boolean>
}

// Model after:
//  apps -> customers -> customer details -> payment methods
//  weekly widget badges - user management -> permissions list

const WeeklyWidgetLineItem: FC<WeeklyWidgetLineItemProps> = (props) => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { date, findItem } = context;
  const { occ, isNewDay, onVerify, onUnverify } = props;

  const theme = getTheme("light");

  const item = findItem(occ.item.documentId);
  const hasPassed: boolean = date.isAfter(occ.date, 'date');

  const [isOpen, setIsOpen] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>("--");
  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsVerified(occ.verification !== undefined);

    // ensures number in verify text box is always positive.
    // we don't want the user to have to enter in negative numbers.
    const amount = Math.abs(occ.verification?.amount ?? occ.item.amount);
    setTextInput(amount.toLocaleString('en-US', { minimumFractionDigits: 2 }));
  }, [occ]);

  const verify = async (forceStandardAmount: boolean = false) => {
    let amount: number;

    if (forceStandardAmount) {
      amount = occ.item.amount;

    } else {
      // Check for empty strings
      if (textInput.trim() === "") {
        setTextInput("");
        return;
      }

      const cleanedString = textInput.replace(/[^0-9.]/g, '');

      // Convert the cleaned string to a number
      amount = parseFloat(cleanedString);
      if (isNaN(amount)) {
        setTextInput("");
        x25log.d("[verify][WeeklyWidgetLineItem.ts]: Can't verify. Invalid verification amount given, %s", textInput);
        return;
      }
    }

    setIsLoading(true);
    const _ = await onVerify(occ.item.documentId, occ.date, Math.abs(amount));
    setTextInput("");
    setIsLoading(false);
  }

  const unverify = async () => {
    if (occ.verification) {
      const success = await onUnverify({
        documentId: occ.verification.documentId,
        id: "--",
        date: occ.date.format("YYYY-MM-DD"),
        item: { documentId: occ.item.documentId, id: "--" }
      });
      if (success) {
        setTextInput("");
      }
    } else {
      x25log.w("[unverify][weekly-widget.tsx]: Could not unverify because verification does not exist. This should not happen. Date: %s, item: %s.", occ.date.format("YYYY-MM-DD"), occ.item.documentId);
    }
  }

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  }

  const handleTextInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(event.target.value);
  };

  const onCheckboxCheck = async (checked: boolean) => {
    if (checked) {
      verify(true);

    } else {
      unverify();
    }
  }

  const onVerifyButtonClick = async () => {
    verify();
  }

  return (
    <div className="line-item-wrapper">
      {isNewDay && <div className="newday mt-6 text-center fs-6 text-gray-400 fw-bold py-2">{isNewDay}</div>}
      <div className={`line-item px-1 py-4 position-relative ${hasPassed ? 'bg-gray-100' : ''}`}>
        <div className="d-flex justify-content-between flex-row align-items-center px-4">
          <div className={"align-items-center fw-semibold d-flex flex-row " + (isOpen ? "show" : "")}>
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
                checked={isVerified}
                onChange={(evt) => onCheckboxCheck(evt.target.checked)}
              />
            </div>
            <div className="line-item-title ms-2 d-flex flex-row flex-wrap">
              <div className="fs-6 fw-bold text-gray-900 mb-1">{item?.name ?? "--"}</div>
              {item?.frequency === "Weekly" &&
                <div><span className="badge badge-light-info fw-bold mx-2">weekly</span></div>
              }
            </div>
          </div>
          <div className="line-item-numbers d-flex flex-row align-items-center">
            <div className="text-gray-900 text-end">
              {occ.verification && Math.abs(occ.verification.amount) != Math.abs(occ.item.amount) ?
                <div
                  style={{ color: item?.type === "income" ? theme.success : "inherit" }}
                  className="fs-5 fw-bold"
                >
                  <span className="text-decoration-line-through me-2 fs-6">
                    {item?.type === "income" && <span>+</span>}
                    ${(item?.amount ?? "--").toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span style={{ color: theme.primary }}>
                    {item?.type === "income" && <span>+</span>}
                    ${(Math.abs(occ.verification?.amount) ?? "--").toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div> :
                <div
                  style={{ color: item?.type === "income" ? theme.success : "inherit" }}
                  className="fs-5 fw-bold"
                >
                  {item?.type === "income" && <span>+</span>}
                  ${(item?.amount ?? "--").toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              }
              {occ.balance && <div className="text-gray-400 running-balance fs-7">${occ.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>}
            </div>
          </div>
        </div>
        {/* collapsable menu */}
        {isOpen &&
          <div className="py-4 d-flex flex-row">
            <div className="me-4">
              <input
                type="text"
                className="form-control form-control-solid py-2"
                value={textInput}
                onChange={handleTextInput}
                disabled={isVerified}
              ></input>
            </div>
            <button
              type="submit"
              className="btn btn-primary fs-8 py-0 px-6 min-w-100px"
              data-kt-indicator={loading ? "on" : "off"}
              onClick={onVerifyButtonClick}
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

type WeeklyWidgetProps = {
  occurrences: Occurrence[],
  range?: string,
  startBal?: number,
  addVerification: (verifications: Schema<"verification">[]) => void,
  deleteVerification: (verifications: Schema<"verification">) => void
}

export const WeeklyWidget: FC<WeeklyWidgetProps> = (props) => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { range, startBal, addVerification, deleteVerification } = props;
  const { verify, unverify, data } = context;

  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);

  const getEndBalance = (): number | undefined => {
    let bal = startBal;
    occurrences.forEach(occ => {
      bal = occ.balance;
    })
    return bal;
  }

  const endBal: number|undefined = getEndBalance();

  const onVerify = async (item: string, date: Dayjs, amount: number): Promise<boolean> => {
    const result = await verify(item, date, amount);
    if (result.status === "success") {
      if (result.data !== null) {
        // Add to map.
        // Add in item documentId since its not populated on POST call response.
        const verification: Schema<"verification"> = { ...result.data, item: { documentId: item }};
        addVerification([verification])
        return true;
      } else {
        x25log.d("[onVerify][weekly-widget.ts]: Can't verify. Got null response.");
      }
    } else {
      x25log.d("[onVerify][weekly-widget.ts]: Can't verify. Error: %s.", result.error);
    }
    return false;
  }

  const onUnverify = async (verification: Schema<"verification">): Promise<boolean> => {
    if (verification.date && verification.item) {
      const result = await unverify(verification.documentId);

      if (result.status === "success") {
        deleteVerification(verification);
        return true;

      } else {
        x25log.d("[onUnverify][weekly-widget.ts]: Can't unverify %s. Error: %s.", verification.documentId, result.error);
      }

    } else {
      x25log.w("[onUnverify][weekly-widget.ts]: Can't unverify %s. Missing verification date or item. This should not happen.", verification.documentId);
    }
    return false;
  }

  useEffect(() => {
    setOccurrences(props.occurrences);
  }, [props.occurrences])


  return (
    // print line items for this week in order.

    <div className="x25-line-item-list">
      <div className="card card-flush p-4">
        <div className="card-header px-0">
          <div className="card-title flex-row d-flex">
            <h3 className="fw-bold mb-1">This Week</h3>
          </div>
          <div className="card-toolbar">
            {range && <p className="text-gray-400 fw-semibold fs-6 mt-2">{range}</p>}
          </div>
        </div>

        <div className="d-flex flex-wrap py-2">
          {startBal !== undefined && <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
            <div className="d-flex align-items-center">
              <div className="fs-2 fw-bold counted">${startBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div className="fw-semibold fs-6 text-gray-400">Start Balance</div>
          </div>}
          {endBal !== undefined &&
            <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
              <div className="d-flex align-items-center">
                <div className="fs-2 fw-bold counted">${endBal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="fw-semibold fs-6 text-gray-400">End Balance</div>
            </div>
          }

          <div className="d-flex flex-column">
            {occurrences.map((occ, i) => {

              let isNewDay = i === 0 || !occurrences[i - 1].date.isSame(occ.date, 'date')
                ? occ.date.format('dddd, M/D')
                : null

              return (
                <div key={i}>
                  <WeeklyWidgetLineItem
                    occ={occ}
                    isNewDay={isNewDay}
                    onVerify={onVerify}
                    onUnverify={onUnverify}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
};