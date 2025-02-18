import React, { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';

// import { saveBudget, getBudget } from '../utils/localStorage';
import { APIResult, APISchemas, budgetTox25, get, itemTox25 } from '../utils/strapi';
import { x25Error, Budget, BudgetItem, BudgetNote } from '../utils/schemas';
import { getUniqueID } from '../utils/util';
import { calculateOccurrences, daysTillNextOccurrence, itemIsActive } from '../utils/budget';
import { x25log } from '../utils/log';
import { boolean } from 'zod';

export type Occurrence = {
  date: Dayjs,
  item: BudgetItem,
  verification?: APISchemas["verification"]
}

type x25Result<T> = { status: "success", data: T } | { status: "fail", error: string }

export type UseBudget = {
  budget?: Budget,
  // error?: x25Error,
  error?: string,
  verify: (occurrence: Occurrence, amount: string) => Promise<x25Result<boolean>>,
  duplicateBudgetItem: (item: BudgetItem) => void,
  deleteBudgetItem: (item: BudgetItem) => void,
  updateBudgetItem: (item: BudgetItem) => void,
  updateBudget: (updates: Record<string, string>) => void,
  convertToBudget: () => void,
  refresh: () => void,
  addNote: (note: BudgetNote) => void,
  deleteNote: (note: BudgetNote) => void,

  // pastDueItems: Occurrence[],
  // upcomingItems: Occurrence[],
  // budget: () => Budget,
  items: (active: boolean) => BudgetItem[]
  getOccurrencesBetween: (start: Dayjs, end: Dayjs) => Promise<x25Result<Occurrence[]>>
}

export const useBudget = (id: string): UseBudget => {

  const [data, setData] = useState<Budget>();
  const [items, setItems] = useState<BudgetItem[]>();
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

      // if (!itemFound) {
      //   items.push(item);
      // }
      // setData(prev => (
      //   prev === undefined ?
      //     undefined :
      //     {
      //       ...prev,
      //       items
      //     }
      // ))
    }
  }


  const verify = async (occurrence: Occurrence, amount: number): Promise<x25Result<boolean>> => {
    // create.
    if ( occurrence.verification === null ){

    } else {
      // update.
    }

    // _updateBudgetItem(item);
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
    // if (data) {
    //   const items = data.items.filter((_item) => _item.id !== item.id);
    //   _updateBudget("items", items);
    // }
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
    const endpoint = `http://localhost:1337/api/budgets/${id}?status=published&populate=items`;
    const result: APIResult<"budget", "one"> = await get(endpoint);
    if (result.status === "success") {
      const budget = result.data;
      if (budget) {
        const x25Budget = budgetTox25(budget);
        if (x25Budget) {
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
    // if (data) {
    //   const notes = data.notes ?? [];
    //   const exists = notes.filter((n) => n.id === note.id);

    //   if (exists.length === 0) {
    //     notes.push(note);
    //     _updateBudget("notes", notes);
    //   }
    // }
  }

  const deleteNote = (note: BudgetNote) => {
    // if (data) {
    //   const notes = (data.notes ?? []).filter((n) => n.id !== note.id);
    //   _updateBudget("notes", notes);
    // }
  }

  const getOccurrencesBetween = async (start: Dayjs, end: Dayjs): Promise<x25Result<Occurrence[]>> => {
    x25log.d("Entered getOccurrencesBetween() in UpcomingItemsWidget. Start: %s, end: %s", start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"));
    
    const itemIsActive = (item: BudgetItem, s: Dayjs, e: Dayjs) => {
      if (item.frequency === "Once"){
        return item.date.isBetween(s, e, "date", "[]");
      
      } else {
        return !item.starts.isAfter(e) && (item.ends === "-1" || !item.ends.isBefore(s));
      } 
    }

    if (data) {
      const occurrences: Occurrence[] = []
      const adjStart = data.startDate.isAfter(start) ? data.startDate : start;
      const endpoint = `http://localhost:1337/api/items?status=published&filters[budget][documentId][$eq]=${data.id}`
      const result = await get<"item", "many">(endpoint);
      if (result.status === "success") {
        x25log.d("Fetched %d items from endpoint %s", result.data.length, endpoint);
        
        const items: BudgetItem[] = result.data
          .map(item => itemTox25(item))
          .filter(item => item !== null)
          .filter(item => itemIsActive(item, adjStart, end))
        ;

        x25log.d("%d/%d budget items are active.", items.length, result.data.length);

        // get verifications
        const v_endpoint = `http://localhost:1337/api/verifications?filters[item][budget][documentId][$eq]=${data.id}&filters[date][$between][0]=${start.format('YYYY-MM-DD')}&filters[date][$between][1]=${end.format('YYYY-MM-DD')}&populate[item][fields][0]=name`
        x25log.d("Fetching verifications from endpoint %s", v_endpoint);

        const verificationsResult = await get<"verification", "many">(v_endpoint);

        if (verificationsResult.status === "success") {
          x25log.d("Fetched %d verifications.", verificationsResult.data.length);

          const vMap: Record<string, Record<string, APISchemas["verification"]>> = {}
          verificationsResult.data.forEach(v => {
            if (v.date !== undefined && v.item !== undefined && v.amount !== undefined) {
              const date = dayjs(v.date).format("YYYY-MM-DD");
              if (undefined === vMap[date]) {
                vMap[date] = {};
              }
              // if (undefined === vMap[date][v.item.documentId]) {
                // vMap[date][v.item.documentId] = v.amount;
              // }
              vMap[date][v.item.documentId] = v;
            }
          })

          // calculate occurrences between start and end.
          // ensure items are active.
          items.forEach(item => {
            const cOccurrences = calculateOccurrences(item, start, end)
            x25log.d("[getOccurrencesBetween][useBudget.ts]: %s occurrs %d times. Range: %s -> %s. Dates: %s", item.name, cOccurrences.length, start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"), cOccurrences.map( d => d.format("YYYY-MM-DD")).join(", "))
            
            cOccurrences.map( occ => { 
              const occdate = occ.format("YYYY-MM-DD");

              const missingVerification = vMap[occdate] === undefined || vMap[occdate][item.id] === undefined;
              if (missingVerification){
                x25log.d("%s item is missing verification on %s", item.name, occ.format("YYYY-MM-DD"));
              }         
              occurrences.push({
                date: occ,
                item,
                verification: missingVerification ? undefined : vMap[occdate][item.id]
              })
            });
          });
        } 
        return {status: "success", data: occurrences};

      } else {
        x25log.d("Error fetching items. endpoint: %s, msg: %s", endpoint, result.error )
        return { status: "fail", error: "Error fetching items. Details " + result.error }
      }

    } else {
      return { status: "fail", error: "Budget does not exist." }
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
    verify,
    updateBudget,
    duplicateBudgetItem,
    deleteBudgetItem,
    updateBudgetItem,
    convertToBudget,
    refresh,
    addNote,
    deleteNote,
    getOccurrencesBetween
  };
}