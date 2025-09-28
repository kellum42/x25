import { useState, useContext } from "react";
import dayjs, { Dayjs } from "dayjs";
// import { getUniqueID } from "../utils/util";
// import { BudgetItem } from "../utils/schemas";
// import { zBudgetItem } from "../utils/schemas";
// import { BudgetContext } from "./budgetContext";

// TODO:
//  - Find a way to incorporate the useBudgetDetails error into the error here.
export type UseMultiScreenModalType = {
  fields: Record<string, string | undefined>,
  loading: boolean,
  error: string | null,
  screen: 0 | 1,
  next: () => void,
  back: () => void,
  update: (name: string, value?: string) => void,
  onSave: () => void
};

export const useMultiScreenModal = (defaults: Record<string, string|undefined> = {}): UseMultiScreenModalType => {

  // const context = useContext(BudgetContext);

  // if (!context) {
  //   throw new Error("Calling Budget Context from outside of provider.");
  // }

  // const { updateBudgetItem } = context;

  const [fields, setFields] = useState<Record<string, string | undefined>>(defaults);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [screen, setScreen] = useState<0 | 1>(0);

  const update = (name: string, value?: string) => {
    setFields((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const save = (): void => {
    setError(null);
    onSave();
  }

  const onSave = (): void => {
    // setError(null);
    
    // const obj: Record<string, any> = { "id": getUniqueID() };

    // Object.keys(fields ?? {}).map((key) => {
    //   const value: string | undefined = (fields ?? {})[key];

    //   if ("starts" === key || "date" === key || "ends" === key) {
    //     if (key === "ends" && value === "-1") {
    //       obj[key] = value;

    //     } else {
    //       const date = dayjs(value);
    //       if (date.isValid()) {
    //         obj[key] = date;
    //       }
    //     }

    //   } else if ("amount" === key && value !== undefined) {
    //     obj[key] = parseFloat(value);

    //   } else if ("dates" === key && value !== undefined) {
    //     obj[key] = value.split(",");

    //   } else if ( "vers" === key && value !== undefined ){
    //     obj[key] = JSON.parse( value );

    //   } else {
    //     obj[key] = value;
    //   }
    // })
    // const response = zBudgetItem.safeParse(obj);
    // if (response.success) {
    //   updateBudgetItem( obj as BudgetItem );
    //   return true;

    // } else {
    //   const err = response.error;
    //   if (err.issues && err.issues.length > 0) {
    //     const issue = err.issues[0];
    //     setError((issue.path.length > 0 ? issue.path[0].toString() + " - " : "") + issue.message);
    //   } else {
    //     setError("An error has occurred. Please try again later.");
    //   }
    //   return false;
    // }
  }

  const next = () => {
    setScreen(1);
  };

  const back = () => {
    setScreen(0);
  };

  return { fields, loading, error, screen, next, back, update, onSave };
};