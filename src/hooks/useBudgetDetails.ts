import React, { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import { saveBudget, getBudget } from '../utils/localStorage';
import { x25Error, Budget, BudgetItem } from '../utils/schemas';

export type UseBudgetDetails = {
  budget?: Budget,
  error?: x25Error,
  verifyAmount: (date: Dayjs, item: BudgetItem, amount: number | null) => void
}

export const useBudgetDetails = (slug: string): UseBudgetDetails => {
  // const verifyFormat = "YYYY-MMM-DD";

  const [data, setData] = useState<Budget>();
  const [error, setError] = useState<x25Error>();

  // Also unverifies.
  const verifyAmount = (date: Dayjs, item: BudgetItem, amount: number | null) => {
    // Save --> setData?
    const year = date.get('year');
    const month = date.get('month') + 1;
    const day = date.get('date');

    if (item.vers !== undefined) {
      if (amount === null) {
        const verificationExists = year in item.vers && month in item.vers[year] && day in item.vers[year][month];
        if (verificationExists) {
          delete item.vers[year][month][day];
        }
      } else {
        if (undefined === item.vers[year]) {
          item.vers[year] = {};
        }
        if (undefined === item.vers[year][month]) {
          item.vers[year][month] = {};
        }
        item.vers[year][month][day] = amount;
      }
    } else {
      if (amount !== null) {
        item.vers = { [year]: { [month]: { [day]: amount } } };
      }
    }

    // setData(prevData => ({
    //   ...prevData,
    //   items: prevData.items.map((_item) => (
    //     item.id === _item.id ? item : _item
    //   ))
    // }));
    setData( prev => (
      prev === undefined ?
      undefined :
      {
        ...prev,
        items: prev.items.map(( _item) => (
          item.id === _item.id ? item: _item
        ))
      }
    ))
  }

  const addBudgetItem = (item: BudgetItem) => {

  }

  useEffect(() => {
    const response = getBudget(slug);
    if ( response.status === "success" ){
      setData(response.data);
    } else {
      setError(response);
    }
    
  }, []);

  useEffect(() => {
    // save data.
    // TODO: - Do something with error on save.
    
    if (data) {
      saveBudget(data)
    }
  }, [data]);

  // useEffect(() => {
  //   console.log(error?.message);
  // }, [error]);

  return { budget: data, error, verifyAmount };
}