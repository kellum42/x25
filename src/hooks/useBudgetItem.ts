import React, { FC, useState } from "react";
import { x25Error } from "../utils/schemas";

type UseBudgetItem = {
  verify: () => void,
  unverify: () => void,
  setAmount: React.Dispatch<React.SetStateAction<string>>,
  loading: boolean,
  error: x25Error
}

export const useBudgetItem: FC<> = (): UseBudgetItem => {
  const [amount, setAmount] = useState<string>("")
}