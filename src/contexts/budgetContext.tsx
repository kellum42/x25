import React, { ReactNode, useState, createContext, useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";

import { useBudgetDetails, UseBudgetDetails } from "../hooks/useBudgetDetails";

type BudgetContextProps = {
  date: Dayjs,
  setDate: React.Dispatch<React.SetStateAction<dayjs.Dayjs>>
}

// TODO:
//  - Maybe show useBudgetDetails errors from here, so it doesn't have to be shown in every sub component.

export const BudgetContext = createContext<(UseBudgetDetails & BudgetContextProps ) | undefined>(undefined);

export const BudgetContextProvider: React.FC<{ slug: string, children: ReactNode }> = ({ slug, children }) => {
  const [date, setDate] = useState<Dayjs>(dayjs())

  const details = useBudgetDetails(slug);

  return (
    <BudgetContext.Provider value={{ ...details, date, setDate }}>
      {children}
    </BudgetContext.Provider>
  )
}


