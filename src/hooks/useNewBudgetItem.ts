import { z } from "zod";

import { useEffect, useState } from "react";
// import { saveBudgetItem } from "../utils/localStorage";
// import { BudgetItem, zBudgetItem } from "./useBudgetDetails";
import dayjs from "dayjs";
import { getUniqueID } from "../utils/util";
import { BudgetItem } from "../utils/schemas";
import { zBudgetItem } from "../utils/schemas";
import { saveBudgetItem } from "../utils/localStorage";

export type UseNewBudgetItemType = {
  fields: { name: string, amount: string, type: string, frequency: string, starts: string, ends: string, date: string, dates: string, day: string },
  loading: boolean,
  error: string | null,
  screen: 0 | 1,
  save: (slug?: string) => boolean,
  next: () => void,
  back: () => void,
  update: (name: string, value?: string) => void
};

export const useNewBudgetItem = (): UseNewBudgetItemType => {

  const [fields, setFields] = useState({
    name: "",
    amount: "",
    type: "expense",
    frequency: "Once",
    starts: "",
    ends: "-1",
    dates: "1",
    date: "",
    day: "Friday"
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [screen, setScreen] = useState<0 | 1>(0);

  const update = (name: string, value?: string) => {
    if (value !== undefined) {
      if (name === "type") {
        if ("income" !== value && "expense" !== value) { return; }
      }

      setFields((prevState) => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const parseError = (err: z.ZodError): string => {
    if ( err.issues && err.issues.length > 0 ){
      const issue = err.issues[0];
      return ( issue.path.length > 0 ? issue.path[0].toString() + " - "  : "" ) + issue.message;
    }
    return "An error has occurred. Please try again later.";
  }

  const validate = (): z.SafeParseReturnType<BudgetItem, BudgetItem> => {
    const obj: Record<string, any> = { "id": getUniqueID() };

    Object.keys(fields).map((key) => {
      const value: string = fields[key as keyof typeof fields];

      if ("starts" === key || "date" === key || "ends" === key) {
        if (key === "ends" && value === "-1") {
          obj[key] = value;

        } else {
          const date = dayjs(value);
          if (date.isValid()) {
            obj[key] = date;
          }
        }

      } else if ("amount" === key) {
        obj[key] = parseFloat(value);

      } else if ("dates" === key) {
        obj[key] = value.split(",");

      } else {
        obj[key] = value;
      }
    })

    return zBudgetItem.safeParse(obj);
  }

  const save = (slug?: string): boolean => {
    setError( null ); // reset errors.

    if ( slug === undefined ){
      setError( "Can't find budget." );
      return false;
    }

    const parse = validate();
    
    if ( parse.success ){
      const item = parse.data as BudgetItem;
      setLoading( true );
      const response = saveBudgetItem( slug, item );
      setLoading( false );

      if ( response.status === "fail" ){
        setError( response.message );
      
      } else {
        return true;
      }
    

    } else {
      setError( parseError( parse.error ));
    }

    return false;
  };

  const next = () => {
    setScreen(1);
  };

  const back = () => {
    setScreen(0);
  };

  return { fields, loading, error, screen, save, next, back, update };
};