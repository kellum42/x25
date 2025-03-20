import React, { ReactNode, useState, createContext, useEffect, useContext } from "react";
import { useOccurrences, UseOccurrences } from "../hooks/useOccurrences";
import { Schema, x25Result } from "../utils/types";
import { Dayjs } from "dayjs";
import { BudgetContext } from "./budgetContext";

// enum AppState {
//   PENDING,
//   LOADING,
//   SUCCESS,
//   FAIL
// }

type OccurrencesContextProviderProps = {
  // start: Dayjs,
  end: Dayjs,
  // items: Schema<"item">[],
  children: ReactNode,
  // getVerifications?: (from: Dayjs, to: Dayjs) => Promise<x25Result<Schema<"verification">[]>>
}

export const OccurrencesContext = createContext<UseOccurrences | undefined>(undefined);

export const OccurrencesContextProvider: React.FC<OccurrencesContextProviderProps> = (props) => {
  // pull in useBudget
  // if still loading or unset, return early
  // then continue with code

  // Maybe include ability to change end date here. 
  // Would have to make it a state variable.
  const context = useContext(BudgetContext);
  
  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { data, getItems } = context;

  if ( data === null ){
    return <p>Budget is not set.</p>
  }

  const { end, children } = props;
  const occurrences: UseOccurrences = useOccurrences(data.startDate, end, getItems());

  // const [status, setStatus] = useState<AppState>(AppState.PENDING);

  // const fetch = async () => {
  //   if (getVerifications) {
  //     setStatus(AppState.LOADING);
  //     const result = await getVerifications(start, end);

  //     if (result.status === "success") {
  //       // update occurrences map.
  //       setStatus(AppState.SUCCESS)

  //     } else {
  //       setStatus(AppState.FAIL);
  //     }
  //   }
  // }

  useEffect(() => {
    // fetch();
  }, []);

  // if (status === AppState.SUCCESS) {
    return (
      <OccurrencesContext.Provider value={{ ...occurrences }}>
        {children}
      </OccurrencesContext.Provider>
    )
  
  // } else if ( status === AppState.FAIL ){
  //   return <p>Error loading budget data.</p>
  
  // } else if ( status === AppState.LOADING ){
  //   return <p>One sec. Loading budget data...</p>
  
  // } else {
  //   return <></>
  // }
}
