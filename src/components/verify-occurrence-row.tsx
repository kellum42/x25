import React, { FC, useContext, useEffect, useState } from "react";
import { OccurrenceRow } from "./occurence-row";
import { Occurrence } from "../hooks/useOccurrences";
import { x25log } from "../utils/log";
import { BudgetContext } from "../contexts/budgetContext";
import { Dayjs } from "dayjs";
import { Schema } from "../utils/types";

type VerifyOccurrenceRowProps = {
  occ: Occurrence,
  onVerify: (item: string, date: Dayjs, amount: number) => Promise<boolean>
  onUnverify: (verification: Schema<"verification">) => Promise<boolean>
}

export const VerifyOccurrenceRow: FC<VerifyOccurrenceRowProps> = (props) => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { occ, onVerify, onUnverify } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>("--");
  const [loading, setIsLoading] = useState(false);

  const amount = `$${Math.abs(occ.item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

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
        x25log.d("[verify][VerifyOccurrenceRow.ts]: Can't verify. Invalid verification amount given, %s", textInput);
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
      x25log.w("[unverify][VerifyOccurrenceRow.ts]: Could not unverify because verification does not exist. This should not happen. Date: %s, item: %s.", occ.date.format("YYYY-MM-DD"), occ.item.documentId);
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

  useEffect(() => {
    setIsVerified(occ.verification !== undefined);

    // ensures number in verify text box is always positive.
    // we don't want the user to have to enter in negative numbers.
    const amount = Math.abs(occ.verification?.amount ?? occ.item.amount);
    setTextInput(amount.toLocaleString('en-US', { minimumFractionDigits: 2 }));
  }, [occ]);

  const checkboxAndDropdown: React.ReactNode = <>
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
  </>

  const verifyDropdown: React.ReactNode =
    isOpen ?
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
      </div> :
      <></>

  return <OccurrenceRow
    occ={occ}
    label={amount}
    subLabel={occ.date.format("M/D/YY")}
    showTags={true}
    beforeTitle={checkboxAndDropdown}
    beforeRowEnds={verifyDropdown}
  />;
}