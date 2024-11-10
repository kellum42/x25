import { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs'

import { getSampleBudgetLineItems } from '../utils/mockData';

export enum BudgetLineItemFrequency { Once = "Once", Weekly = "weekly", Biweekly = "Bi-Weekly", Monthly = "Monthly" }
export enum WeeklyBudgetLineItemDays {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday"
}

type BaseBudgetLineItem = {
  id: number;
  groupId?: number;
  name: String;
  amount: number;
  type: "income" | "expense";
  frequency: BudgetLineItemFrequency;
}
type OneTimeBudgetLineItem = BaseBudgetLineItem & {
  frequency: BudgetLineItemFrequency.Once,
  date: Dayjs
}
type WeeklyBudgetLineItem = BaseBudgetLineItem & {
  frequency: BudgetLineItemFrequency.Weekly | BudgetLineItemFrequency.Biweekly,
  day: WeeklyBudgetLineItemDays,
  starts: Dayjs
  ends: Dayjs | -1
}
type MonthlyBudgetLineItem = BaseBudgetLineItem & {
  frequency: BudgetLineItemFrequency.Monthly,
  dates: number[],
  starts: Dayjs,
  ends: Dayjs | -1
}
export type BudgetLineItem = OneTimeBudgetLineItem | WeeklyBudgetLineItem | MonthlyBudgetLineItem;

export type BudgetDetailsResponse = {
  title: string,
  slug: string,
  startingBalance: number,
  startDate: Dayjs,
  budgetLineItems: BudgetLineItem[]
}


export const useBudgetDetails = (slug: String): BudgetDetailsResponse | null => {

  const [data, setData] = useState<BudgetDetailsResponse | null>(null)


  useEffect(() => {

    // query budget based on slug.

    const response: BudgetDetailsResponse = {
      title: "2024 Kellum Family Vacation",
      slug: "2024-kellum-family-vacation",
      startingBalance: 5000,
      startDate: dayjs("10-15-2024"),
      budgetLineItems: getSampleBudgetLineItems()
    }
    setData(response);
  }, []);

  return data;
}