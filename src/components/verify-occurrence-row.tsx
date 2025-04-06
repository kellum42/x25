import React, { FC, useContext, useEffect, useState } from "react";
import { OccurrenceRow } from "./occurence-row";
import { Occurrence } from "../hooks/useOccurrences";
import { x25log } from "../utils/log";
import { BudgetContext } from "../contexts/budgetContext";
import { Dayjs } from "dayjs";
import { Schema } from "../utils/types";

type VerifyOccurrenceRowProps = {
  occ: Occurrence,
  onVerified: (verification: Schema<"verification">) => void,
  onUnVerified: (verification: Schema<"verification">) => void,
  subLabel?: string,
  beforeRow?: React.ReactNode
  subtitle?: string
  // onVerify: (item: string, date: Dayjs, amount: number) => Promise<boolean>
  // onUnverify: (verification: Schema<"verification">) => Promise<boolean>
}

export const VerifyOccurrenceRow: FC<VerifyOccurrenceRowProps> = (props) => {
  const useBudget = useContext(BudgetContext);

  if (!useBudget) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  // const { verify, unverify } = context;
  const { occ } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>("--");
  const [loading, setIsLoading] = useState(false);

  const amount = `$${Math.abs(props.occ.item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  const amountNode = (): React.ReactNode|string => {
    const type: "income"|"expense" = occ.item.amount > 0 ? "income" : "expense";

    if (occ.verification && Math.abs(occ.verification.amount) !== Math.abs(occ.item.amount)){
      const vAmountString = "$" + Math.abs(occ.verification.amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
      return <>
        <span className="text-decoration-line-through">{amount}</span>
        { 
          type === "income" ?
          <span className="ms-2 text-success">+{vAmountString}</span> :
          <span className="ms-2 text-primary">{vAmountString}</span>
        }
      </>
    } else {
      const inner = occ.verification ? Math.abs(occ.verification.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) : amount;
      return type === "income" ? <span className="text-success">+{inner}</span> : inner;
    }
  }

  const cleanVerifiedAmount = (): number | null => {
    // Check for empty strings
    if (textInput.trim() === "") {
      setTextInput("");
      return null;
    }

    const cleanedString = textInput.replace(/[^0-9.]/g, '');

    // Convert the cleaned string to a number
    const amount = parseFloat(cleanedString);

    if (isNaN(amount)) {
      setTextInput("");
      x25log.d("[validate][VerifyOccurrenceRow.tsx]: Invalid verification amount given, %s", textInput);
      return null;
    }
    return amount;
  }

  const verify = async (forceStandardAmount: boolean = false) => {
    const amount: number | null = forceStandardAmount ? occ.item.amount : cleanVerifiedAmount();

    const item = occ.item.documentId;
    const date = occ.date;

    if (amount !== null) {
      setIsLoading(true);
      const result = await useBudget.verify(item, date, Math.abs(amount));
      if (result.status === "success") {
        if (result.data !== null) {
          // Add to map.
          // Add in item documentId since its not populated on POST call response.
          const verification: Schema<"verification"> = { ...result.data, item: { documentId: item } };
          x25log.d("[verify][VerifyOccurrenceRow.tsx]: Verified %s.", verification.documentId);
          props.onVerified(verification);
          setIsVerified(true);
          
        } else {
          x25log.d("[verify][VerifyOccurrenceRow.tsx]: Can't verify. Got null response.");
        }
      } else {
        x25log.d("[verify][VerifyOccurrenceRow.tsx]: Can't verify. Error: %s.", result.error);
      }
      setTextInput("");
      setIsLoading(false);

    } else {
      // error handling. maybe set an error?
      x25log.d("[verify][VerifyOccurrenceRow.tsx]: Unable to verify item %s, date: %s.", item, date.format("YYYY-MM-DD"));
    }
  }

  const unverify = async () => {
    const verification = occ.verification;
    if (verification) {
      // if (verification.date && verification.item) {
      const result = await useBudget.unverify(verification.documentId);

      if (result.status === "success") {
        x25log.d("[unverify][VerifyOccurrenceRow.tsx]: Unverified %s.", verification.documentId);
        
        props.onUnVerified({
          documentId: verification.documentId,
          id: "--",
          date: occ.date.format("YYYY-MM-DD"),
          item: { documentId: occ.item.documentId, id: "--" }
        })
        setIsVerified(false);

        // deleteVerification(verification);
        // return true;

      } else {
        x25log.d("[unverify][VerifyOccurrenceRow.tsx]: Can't unverify %s. Error: %s.", verification.documentId, result.error);
      }

      // } else {
      //   x25log.w("[onUnverify][weekly-widget.ts]: Can't unverify %s. Missing verification date or item. This should not happen.", verification.documentId);
      // }
      return false;

    } else {
      x25log.w("[unverify][VerifyOccurrenceRow.tsx]: Could not unverify because verification does not exist. This should not happen. Date: %s, item: %s.", occ.date.format("YYYY-MM-DD"), occ.item.documentId);
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
    <div className="me-2 rotate-90" style={{ transform: isOpen ? "rotateZ(90deg)" : "none" }}>
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
    label={amountNode()}
    subLabel={ props.subLabel ?? occ.date.format("M/D/YY")}
    showTags={true}
    beforeTitle={checkboxAndDropdown}
    afterRow={verifyDropdown}
    beforeRow={props.beforeRow}
    subtitle={props.subtitle}
  />;
}