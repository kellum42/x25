import React, { useState, useEffect, ReactNode, createContext } from 'react';
import dayjs, { Dayjs } from 'dayjs'

import { saveBudget, getBudget } from '../utils/localStorage';
// import { getSampleBudgetLineItems } from '../utils/mockData';

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
  id: string;
  groupId?: number;
  name: String;
  amount: number;
  type: "income" | "expense";
  frequency: BudgetLineItemFrequency;
  vers?: Record<string, Record<string, Record<string, number>>>
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

export type Budget = {
  id: string,
  title: string,
  slug: string,
  startingBalance: number,
  startDate: Dayjs,
  budgetLineItems: BudgetLineItem[],
  adjs?: Record<string, number>
}

export type UseBudgetDetails = {
  budget: Budget | null,
  verifyAmount: ( date: Dayjs, item: BudgetLineItem, amount: number|null ) => void
}

export const useBudgetDetails = (slug: string): UseBudgetDetails => {
  // const verifyFormat = "YYYY-MMM-DD";

  const [data, setData] = useState<Budget | null>(null)

  // Also unverifies.
  const verifyAmount = ( date: Dayjs, item: BudgetLineItem, amount: number | null ) => {
    // Save --> setData?
    const year = date.get( 'year' );
    const month = date.get( 'month' ) + 1;
    const day = date.get( 'date' );

    if ( item.vers !== undefined ){
      if ( amount === null ){
        const verificationExists = year in item.vers && month in item.vers[year] && day in item.vers[year][month];
        if ( verificationExists ){
          delete item.vers[year][month][day];
        }
      } else {
        if ( undefined === item.vers[year] ){
          item.vers[year] = {};
        }
        if ( undefined === item.vers[year][month] ){
          item.vers[year][month] = {};
        }
        item.vers[year][month][day] = amount;
      }
    } else {
      if ( amount !== null ){
        item.vers = { [year]: { [month]: { [day]: amount }}};
      }
    }
    
    setData( prevData => prevData ? ({
      ...prevData,
      budgetLineItems: prevData.budgetLineItems.map(( _item ) => (
        item.id === _item.id ? item : _item
      ))
    }) : null );
  }

  // const getVerifiedAmt = ( item: BudgetLineItem, date: Dayjs ): number|null => {
  //   const dateString = date.format( verifyFormat );
  //   if ( item.vers !== undefined && dateString in item.vers ){
  //     return item.vers[dateString];
  //   }
  //   return null;
  // }

  useEffect(() => {
    // query budget based on slug.
    // const response: Budget = {
    //   id: "15",
    //   title: "2024 Kellum Family Vacation",
    //   slug: "2024-kellum-family-vacation",
    //   startingBalance: 5000,
    //   startDate: dayjs("10-15-2024"),
    //   budgetLineItems: getSampleBudgetLineItems()
    // }
    const response = getBudget( slug );
    setData(response);
  }, []);

  useEffect( () => {  
    // save data.
    // TODO: - Do something with error on save.
    if ( data ){
      saveBudget( data )
    }
  }, [data]);

  return { budget: data, verifyAmount };
}