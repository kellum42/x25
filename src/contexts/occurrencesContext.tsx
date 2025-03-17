import React, { ReactNode, useState, createContext, useEffect } from "react";
import { useOccurrences, UseOccurrences } from "../hooks/useOccurrences";
import { Schema, x25Result } from "../utils/types";
import { Dayjs } from "dayjs";

enum AppState {
  PENDING,
  LOADING,
  SUCCESS,
  FAIL
}

type OccurrencesContextProviderProps = {
  start: Dayjs,
  end: Dayjs,
  items: Schema<"item">[],
  children: ReactNode,
  getVerifications?: (from: Dayjs, to: Dayjs) => Promise<x25Result<Schema<"verification">[]>>
}

export const OccurrencesContext = createContext<UseOccurrences | undefined>(undefined);

export const OccurrencesContextProvider: React.FC<OccurrencesContextProviderProps> = (props) => {
  const { start, end, items, children, getVerifications } = props;
  const occurrences: UseOccurrences = useOccurrences(start, end, items);

  const [status, setStatus] = useState<AppState>(AppState.PENDING);

  const fetch = async () => {
    if (getVerifications) {
      setStatus(AppState.LOADING);
      const result = await getVerifications(start, end);

      if (result.status === "success") {
        // update occurrences map.
        setStatus(AppState.SUCCESS)

      } else {
        setStatus(AppState.FAIL);
      }
    }
  }

  useEffect(() => {
    fetch();
  }, []);

  if (status === AppState.SUCCESS) {
    return (
      <OccurrencesContext.Provider value={{ ...occurrences }}>
        {children}
      </OccurrencesContext.Provider>
    )
  
  } else if ( status === AppState.FAIL ){
    return <p>Error loading budget data.</p>
  
  } else if ( status === AppState.LOADING ){
    return <p>One sec. Loading budget data...</p>
  
  } else {
    return <></>
  }
}