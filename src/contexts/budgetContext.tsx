import React, { ReactNode, useState, createContext, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";

import { useBudget, UseBudget } from "../hooks/useBudget";

type BudgetContextProps = {
  date: Dayjs,
  setDate: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>
}

// TODO:
//  - Maybe show useBudgetDetails errors from here, so it doesn't have to be shown in every sub component.

export const BudgetContext = createContext<(UseBudget & BudgetContextProps ) | undefined>(undefined);

export const BudgetContextProvider: React.FC<{ slug: string, children: ReactNode }> = ({ slug, children }) => {
  const [date, setDate] = useState<Dayjs>(dayjs())

  const details = useBudget(slug);

  return (
    <BudgetContext.Provider value={{ ...details, date, setDate }}>
      {children}
    </BudgetContext.Provider>
  )
}


