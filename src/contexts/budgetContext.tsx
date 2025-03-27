import React, { ReactNode, useState, createContext, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";

import { useBudget, UseBudget } from "../hooks/useBudget";
import { useOccurrences } from "../hooks/useOccurrences";
import { x25Budget } from "../utils/types";

type BudgetContextProps = {
  date: Dayjs,
  setDate: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>
}

type BudgetContextType = Omit<UseBudget, "data"> & {data: x25Budget } & BudgetContextProps

// TODO:
//  - Maybe show useBudgetDetails errors from here, so it doesn't have to be shown in every sub component.

export const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetContextProvider: React.FC<{ slug: string, children: ReactNode }> = ({ slug, children }) => {
  
  const budget = useBudget(slug);
  
  const [date, setDate] = useState<Dayjs>(dayjs())

  // if ( budget.data === null ){
  //   if ( budget.loading){
  //     return 
  //   }

  // } else {
  //   <BudgetContext.Provider value={{ ...budget, data: budget.data, date, setDate }}>
  //       {children}
  //   </BudgetContext.Provider>
  // }
  return (
    budget.data ? 
      
      <BudgetContext.Provider value={{ ...budget, data: budget.data, date, setDate }}>
        {children}
        {/* <p>budget loaded</p> */}
      </BudgetContext.Provider> :

      budget.loading ? 
        <p>One sec. Loading budget...</p> :
        <p>{budget.error ?? "Error loading budget."}</p>
  )
}


