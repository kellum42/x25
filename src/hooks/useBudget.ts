import React, { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';

// import { saveBudget, getBudget } from '../utils/localStorage';
import { APIResult, budgetTox25, get } from '../utils/strapi';
import { x25Error, Budget, BudgetItem, BudgetNote } from '../utils/schemas';
import { getUniqueID } from '../utils/util';


export type UseBudgetDetails = {
  budget?: Budget,
  // error?: x25Error,
  error?: string,
  verifyAmount: (date: Dayjs, item: BudgetItem, amount: number | null) => void,
  duplicateBudgetItem: (item: BudgetItem) => void,
  deleteBudgetItem: (item: BudgetItem) => void,
  updateBudgetItem: (item: BudgetItem) => void,
  updateBudget: (updates: Record<string, string>) => void,
  convertToBudget: () => void,
  refresh: () => void,
  addNote: (note: BudgetNote) => void,
  deleteNote: (note: BudgetNote) => void
}

export const useBudgetDetails = (id: string): UseBudgetDetails => {

  const [data, setData] = useState<Budget>();
  const [error, setError] = useState<string>();

  const _updateBudget = (key: keyof Budget, value: string | number | Dayjs | BudgetItem[] | BudgetNote[]) => {
    setData(prev => (
      prev === undefined ?
        undefined :
        {
          ...prev,
          [key]: value
        }
    ))
  }

  const _updateBudgetItem = (item: BudgetItem) => {
    if (data === undefined) {
      // setError({
      //   status: "fail",
      //   message: "ERROR: Data is undefined. updateBudgetItem() -> useBudgetDetails"
      // })
    } else {
      let itemFound = false;
      const items = data.items.map(_item => {
        if (_item.id === item.id) {
          itemFound = true;
          return item;
        } else {
          return _item;
        }
      });

      if (!itemFound) {
        items.push(item);
      }
      setData(prev => (
        prev === undefined ?
          undefined :
          {
            ...prev,
            items
          }
      ))
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
    _updateBudgetItem(item);
  }

  const duplicateBudgetItem = (item: BudgetItem) => {
    const duplicate: BudgetItem = {
      ...item,
      name: "Copy of " + item.name,
      id: getUniqueID()
    }
    _updateBudgetItem(duplicate);
  }

  const updateBudgetItem = (item: BudgetItem) => {
    _updateBudgetItem(item);
  }

  const updateBudget = (_updates: Record<string, string>) => {
    if (data === undefined) {
      // setError({ status: "fail", message: "Can't update budget. It does not exist" });

    } else {

      const updates: Budget = { ...data, items: data.items, avatar: data.avatar };

      for (const key in _updates) {
        if ("startingBalance" === key) {
          updates.startingBalance = parseFloat(_updates[key]);

        } else if ("startDate" === key) {
          updates.startDate = dayjs(_updates[key]);

        } else if ("title" === key) {
          updates.title = _updates[key];

        }
        // else if ( "slug" === key ){
        //   updates.slug = _updates[key];
        // }
      }

      setData(prev => (
        prev === undefined ?
          undefined :
          { ...prev, ...updates }
      ))
    }
  }

  const deleteBudgetItem = (item: BudgetItem) => {
    if (data) {
      const items = data.items.filter((_item) => _item.id !== item.id);
      _updateBudget("items", items);
    }
  }

  const convertToBudget = () => {
    if (data) {
      const updates: Budget = { ...data, items: data.items, avatar: data.avatar };
      delete updates.parent;
      setData(prev => (
        prev === undefined ?
          undefined :
          { ...updates }
      ))
    }
  }

  const refresh = async () => {
    // const response = getBudget(id);
    // if (response.status === "success") {
    //   setData(response.data);
    // } else {
    //   setError(response);
    // }
    const endpoint = `http://localhost:1337/api/budgets/${id}`;
    const result: APIResult<"budget", "one"> = await get(endpoint);
    if (result.status === "success") {
      const budget = result.data;
      if ( budget ){
        const x25Budget = budgetTox25( budget );
        if ( x25Budget ){
          console.log(x25Budget);
          console.log(budget);
          setData(x25Budget);

        } else {
          setError("Error getting budget. [Error converting APIResponseSchema<budget> to Budget]");
        }
      } else {
        setError("Error getting budget. [Unable to fetch budget from api]");
      }

    } else {
      console.log(result.error);
    }
  }

  const addNote = (note: BudgetNote) => {
    if (data) {
      const notes = data.notes ?? [];
      const exists = notes.filter((n) => n.id === note.id);

      if (exists.length === 0) {
        notes.push(note);
        _updateBudget("notes", notes);
      }
    }
  }

  const deleteNote = (note: BudgetNote) => {
    if (data) {
      const notes = (data.notes ?? []).filter((n) => n.id !== note.id);
      _updateBudget("notes", notes);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    // save data.
    // TODO: - Do something with error on save.
    setError(undefined)

    if (data) {
      // const response = saveBudget(data);
      // if (response.status === "fail") {
      //   setError(response);
      //   console.log("ERROR ON BUDGET SAVE: %s", response.message);
      // }
    }
  }, [data]);

  return {
    budget: data,
    error,
    verifyAmount,
    updateBudget,
    duplicateBudgetItem,
    deleteBudgetItem,
    updateBudgetItem,
    convertToBudget,
    refresh,
    addNote,
    deleteNote
  };
}