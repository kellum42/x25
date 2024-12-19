import React, { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';

import { saveBudget, getBudget } from '../utils/localStorage';
import { x25Error, Budget, BudgetItem } from '../utils/schemas';
import { getUniqueID } from '../utils/util';

export type UseBudgetDetails = {
  budget?: Budget,
  error?: x25Error,
  verifyAmount: (date: Dayjs, item: BudgetItem, amount: number | null) => void,
  duplicateBudgetItem: (item: BudgetItem) => void,
  deleteBudgetItem: (item: BudgetItem) => void
}

export const useBudgetDetails = (slug: string): UseBudgetDetails => {

  const [data, setData] = useState<Budget>();
  const [error, setError] = useState<x25Error>();

  const updateBudget = (key: keyof Budget, value: string|number|Dayjs|BudgetItem[]) => {
    setData( prev => (
      prev === undefined ?
      undefined :
      {
        ...prev,
        [key]: value
      }
    ))
  }

  const updateBudgetItem = (item: BudgetItem) => {
    if ( data === undefined ){
      setError({
        status: "fail",
        message: "ERROR: Data is undefined. updateBudgetItem() -> useBudgetDetails"
      })
    } else {
      if (item.id in data.items) {
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
      } else {
        const items = data.items;
        items.push(item);
        setData( prev => (
          prev === undefined ?
          undefined :
          {
            ...prev,
            items
          }
        ))
      }
    }
  }

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
    updateBudgetItem(item);
  }

  const duplicateBudgetItem = (item: BudgetItem) => {
    const duplicate: BudgetItem = {
      ...item,
      name: "Copy of " + item.name,
      id: getUniqueID()
    }
    updateBudgetItem(duplicate);
  }

  const addBudgetItem = (item: BudgetItem) => {

  }

  const deleteBudgetItem = (item: BudgetItem) => {
    if ( data ){
      const items = data.items.filter((_item) => _item.id !== item.id);
      updateBudget( "items", items );
    }
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
    setError(undefined)
    
    if (data) {
      const response = saveBudget(data);
      if ( response.status === "fail" ){
        setError( response );
        console.log("ERROR ON BUDGET SAVE: %s", response.message);
      }
    }
  }, [data]);

  return { budget: data, error, verifyAmount, duplicateBudgetItem, deleteBudgetItem };
}