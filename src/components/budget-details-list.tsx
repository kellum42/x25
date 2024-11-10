import React, { FC } from "react"
import dayjs, { Dayjs } from "dayjs";
import { BudgetLineItem } from "../hooks/useBudgetDetails";

type BudgetDetailsLineItemListProps = {
  date: Dayjs,
  lineItems: BudgetLineItem[]
}

export const BudgetDetailsLineItemList: FC<BudgetDetailsLineItemListProps> = (props) => {
  return (
    <div>budget items list</div>
  )
};