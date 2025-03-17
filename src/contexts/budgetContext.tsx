import React, { ReactNode, useState, createContext, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";

import { useBudget, UseBudget } from "../hooks/useBudget";
import { useOccurrences } from "../hooks/useOccurrences";

type BudgetContextProps = {
  date: Dayjs,
  setDate: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>
}

// TODO:
//  - Maybe show useBudgetDetails errors from here, so it doesn't have to be shown in every sub component.

export const BudgetContext = createContext<(UseBudget & BudgetContextProps) | undefined>(undefined);

export const BudgetContextProvider: React.FC<{ slug: string, children: ReactNode }> = ({ slug, children }) => {
  
  const budget = useBudget(slug);

  const [date, setDate] = useState<Dayjs>(dayjs())

  return (
    budget.data ? 
      
      <BudgetContext.Provider value={{ ...budget, date, setDate }}>
        {children}
      </BudgetContext.Provider> :

      budget.loading ? 
        <p>One sec. Loading budget...</p> :
        <p>{budget.error ?? "Error loading budget."}</p>
  )
}


