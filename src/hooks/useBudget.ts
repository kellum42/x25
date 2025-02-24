import React, { useState, useEffect } from 'react';
import dayjs, { Dayjs } from 'dayjs';

// import { saveBudget, getBudget } from '../utils/localStorage';
import { get, update, CreateableSchema, Schema, x25Result, Response } from '../utils/strapi';
import { x25Error, Budget, BudgetItem, BudgetNote } from '../utils/schemas';
import { getUniqueID } from '../utils/util';
import { calculateOccurrences, daysTillNextOccurrence, itemIsActive } from '../utils/occurrence';
import { x25log } from '../utils/log';
import { isGoodItem } from '../utils/isGood';
import { Occurrence } from '../utils/occurrence';
import Day from 'react-datepicker/dist/day';
// import { boolean } from 'zod';
// import { asWorkableItem, WorkableItem } from '../utils/workable';

// export type Occurrence = {
//   date: Dayjs,
//   item: Schema<"item">,
//   verification?: Schema<"verification">
// }

// type x25Result<T> = { status: "success", data: T } | { status: "fail", error: string }

export type UseBudget = {
  budget?: Schema<"budget">,
  // error?: x25Error,
  error?: string,
  // verify: (occurrence: Occurrence, amount: string) => Promise<x25Result<boolean>>,
  verify: (occurrence: Occurrence, amount: number) => Promise<x25Result<Response<"verification", "one">>>,
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
  // items: (active: boolean) => BudgetItem[]
  // getOccurrencesBetween: (start: Dayjs, end: Dayjs) => Promise<x25Result<Occurrence[]>>
  getVerifications: (from: Dayjs, to: Dayjs) => Promise<x25Result<Record<string, Schema<"verification">[]>>>
}

export const useBudget = (id: string): UseBudget => {

  const [data, setData] = useState<Schema<"budget">>();
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

  // const _updateBudgetItem = (item: BudgetItem) => {
  // if (data === undefined) {
  //   // setError({
  //   //   status: "fail",
  //   //   message: "ERROR: Data is undefined. updateBudgetItem() -> useBudgetDetails"
  //   // })
  // } else {
  //   let itemFound = false;
  //   const items = data.items.map(_item => {
  //     if (_item.id === item.id) {
  //       itemFound = true;
  //       return item;
  //     } else {
  //       return _item;
  //     }
  //   });

  //   // if (!itemFound) {
  //   //   items.push(item);
  //   // }
  //   // setData(prev => (
  //   //   prev === undefined ?
  //   //     undefined :
  //   //     {
  //   //       ...prev,
  //   //       items
  //   //     }
  //   // ))
  // }
  // }


  const verify = async (occurrence: Occurrence, amount: number): Promise<x25Result<Response<"verification", "one">>> => {
    const body: CreateableSchema<"verification"> = {
      date: occurrence.date.format("YYYY-MM-DD"),
      amount: amount,
      item: occurrence.item.id,
    }

    // create.
    if (occurrence.verification === null || occurrence.verification?.documentId === null) {
      return { status: "fail", error: "idk" }
    } else {
      // update.
      const endpoint = `http://localhost:1337/api/verifications/${occurrence.verification.documentId}`;
      const result = await update<"verification">(endpoint, { data: body })
      return result;
    }
  }

  const duplicateBudgetItem = (item: BudgetItem) => {
    const duplicate: BudgetItem = {
      ...item,
      name: "Copy of " + item.name,
      id: getUniqueID()
    }
    // _updateBudgetItem(duplicate);
  }

  const updateBudgetItem = (item: BudgetItem) => {
    // _updateBudgetItem(item);
  }

  const updateBudget = (_updates: Record<string, string>) => {
    // if (data === undefined) {
    //   // setError({ status: "fail", message: "Can't update budget. It does not exist" });

    // } else {

    //   const updates: Budget = { ...data, items: data.items, avatar: data.avatar };

    //   for (const key in _updates) {
    //     if ("startingBalance" === key) {
    //       updates.startingBalance = parseFloat(_updates[key]);

    //     } else if ("startDate" === key) {
    //       updates.startDate = dayjs(_updates[key]);

    //     } else if ("title" === key) {
    //       updates.title = _updates[key];

    //     }
    //     // else if ( "slug" === key ){
    //     //   updates.slug = _updates[key];
    //     // }
    //   }

    //   setData(prev => (
    //     prev === undefined ?
    //       undefined :
    //       { ...prev, ...updates }
    //   ))
    // }
  }

  const deleteBudgetItem = (item: BudgetItem) => {
    // if (data) {
    //   const items = data.items.filter((_item) => _item.id !== item.id);
    //   _updateBudget("items", items);
    // }
  }

  const convertToBudget = () => {
    // if (data) {
    //   const updates: Budget = { ...data, items: data.items, avatar: data.avatar };
    //   delete updates.parent;
    //   setData(prev => (
    //     prev === undefined ?
    //       undefined :
    //       { ...updates }
    //   ))
    // }
  }

  const refresh = async () => {
    const endpoint = `http://localhost:1337/api/budgets/${id}?status=published&populate=items`;
    const result: x25Result<Response<"budget", "one">> = await get<"budget", "one">(endpoint);
    if (result.status === "success") {
      const budget = result.data;
      if (budget) {
        x25log.d("[refresh][useBudget.ts]: Successful fetched budget %s from %s.", budget.title ?? "--", endpoint);
        setData(budget);

      } else {
        x25log.d("[refresh][useBudget.ts]: Successful API call for budget, but budget data is bad.");
        setError("Error getting budget. [Unable to fetch budget from api]");
      }

    } else {
      x25log.d("[refresh][useBudget.ts]: Unsuccessful API call for budget to endpoint %s.", endpoint);
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

  const getVerifications = async (from: Dayjs, to: Dayjs): Promise<x25Result<Record<string, Schema<"verification">[]>>> => {
    const endpoint = `http://localhost:1337/api/verifications?filters[item][budget][documentId][$eq]=${data.documentId}&filters[date][$between][0]=${from.format('YYYY-MM-DD')}&filters[date][$between][1]=${to.format('YYYY-MM-DD')}&populate[item][fields][0]=name`
    x25log.d("[getVerifications][useBudget.ts]: Fetching verifications from endpoint %s", endpoint);

    const result = await get<"verification", "many">(endpoint);

    if (result.status === "success") {
      x25log.d("[getVerifications][useBudget.ts]: Successfully fetched %d verifications.", result.data.length);

      // const vMap: Record<string, Record<string, Schema<"verification">>> = {}
      // result.data.forEach(v => {
      //   if (v.date !== undefined && v.item !== undefined && v.amount !== undefined) {
      //     const date = dayjs(v.date).format("YYYY-MM-DD");
      //     if (undefined === vMap[date]) {
      //       vMap[date] = {};
      //     }
      //     vMap[date][v.item.documentId] = v;
      //   }
      // })
      const map: Record<string, Schema<"verification">[]> = {};
      result.data.forEach(v => {
        if (v.date !== undefined && v.item !== undefined && v.amount !== undefined) {
          if ( undefined === map[v.item.documentId]){
            map[v.item.documentId] = []
          }
          map[v.item.documentId].push(v);

        } else {
          x25log.w("[getVerifications][useBudget.ts]: Verification %s is incomplete.", v.documentId);
        }
      })
      return {status: "success", data: map};

    } else {
      x25log.d("[getVerifications][useBudget.ts]: Failed to fetch verifications from %s. Details -> %s.", endpoint, result.error);
      return result;
    }
  }

  // const getOccurrencesBetween = async (start: Dayjs, end: Dayjs): Promise<x25Result<Occurrence[]>> => {
  //   x25log.d("Entered getOccurrencesBetween() in UpcomingItemsWidget. Start: %s, end: %s", start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"));

  //   const itemIsActive = (item: Schema<"item">, s: Dayjs, e: Dayjs) => {
  //     if (item.frequency === "Once") {
  //       return dayjs(item.date).isBetween(s, e, "date", "[]");

  //     } else {
  //       return !dayjs(item.starts).isAfter(e) && (item.ends === "-1" || !dayjs(item.ends).isBefore(s));
  //     }
  //   }

  //   if (data && data.startDate !== undefined) {
  //     const occurrences: Occurrence[] = []
  //     const budgetStart = dayjs(data.startDate);
  //     const adjStart = budgetStart.isAfter(start) ? budgetStart : start;
  //     const endpoint = `http://localhost:1337/api/items?status=published&filters[budget][documentId][$eq]=${data.documentId}`
  //     const result = await get<"item", "many">(endpoint);
  //     if (result.status === "success") {
  //       x25log.d("[getOccurrencesBetween][useBudget.ts]: Fetched %d items from endpoint %s", result.data.length, endpoint);

  //       const items: Schema<"item">[] = result.data
  //         // .map(item => asWorkableItem(item))
  //         .filter(item => isGoodItem(item))
  //         .filter(item => itemIsActive(item, adjStart, end))
  //         ;

  //       x25log.d("[getOccurrencesBetween][useBudget.ts]: %d/%d budget items are active.", items.length, result.data.length);

  //       // get verifications
  //       const v_endpoint = `http://localhost:1337/api/verifications?filters[item][budget][documentId][$eq]=${data.id}&filters[date][$between][0]=${start.format('YYYY-MM-DD')}&filters[date][$between][1]=${end.format('YYYY-MM-DD')}&populate[item][fields][0]=name`
  //       x25log.d("[getOccurrencesBetween][useBudget.ts]: Fetching verifications from endpoint %s", v_endpoint);

  //       const verificationsResult = await get<"verification", "many">(v_endpoint);

  //       if (verificationsResult.status === "success") {
  //         x25log.d("[getOccurrencesBetween][useBudget.ts]: Fetched %d verifications.", verificationsResult.data.length);

  //         const vMap: Record<string, Record<string, Schema<"verification">>> = {}
  //         verificationsResult.data.forEach(v => {
  //           if (v.date !== undefined && v.item !== undefined && v.amount !== undefined) {
  //             const date = dayjs(v.date).format("YYYY-MM-DD");
  //             if (undefined === vMap[date]) {
  //               vMap[date] = {};
  //             }
  //             vMap[date][v.item.documentId] = v;
  //           }
  //         })

  //         // calculate occurrences between start and end.
  //         // ensure items are active.
  //         items.forEach(item => {
  //           const cOccurrences = calculateOccurrences(item, start, end)
  //           x25log.d("[getOccurrencesBetween][useBudget.ts]: %s occurrs %d times. Range: %s -> %s. Dates: %s", item.name ?? "--", cOccurrences.length, start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"), cOccurrences.map(d => d.format("YYYY-MM-DD")).join(", "))

  //           cOccurrences.map(occ => {
  //             const occdate = occ.format("YYYY-MM-DD");

  //             const missingVerification = vMap[occdate] === undefined || vMap[occdate][item.id] === undefined;
  //             if (missingVerification) {
  //               x25log.d("%s item is missing verification on %s", item.name ?? "--", occ.format("YYYY-MM-DD"));
  //             }
  //             occurrences.push({
  //               date: occ,
  //               item,
  //               verification: missingVerification ? undefined : vMap[occdate][item.id]
  //             })
  //           });
  //         });
  //       }
  //       return { status: "success", data: occurrences };

  //     } else {
  //       x25log.d("Error fetching items. endpoint: %s, msg: %s", endpoint, result.error)
  //       return { status: "fail", error: "Error fetching items. Details " + result.error }
  //     }

  //   } else {
  //     return { status: "fail", error: "Budget does not exist." }
  //   }
  // }


  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    // save data.
    // TODO: - Do something with error on save.
    setError(undefined)

    if (data) {
      x25log.d("[useEffect][useBudget.ts]: Budget was set to %s. ID -> %s.", data.title ?? "--", data.documentId);
      // const response = saveBudget(data);
      // if (response.status === "fail") {
      //   setError(response);
      //   console.log("ERROR ON BUDGET SAVE: %s", response.message);
      // }
    } else {
      x25log.d("[useEffect][useBudget.ts]: Budget was unset.");
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
    getVerifications
  };
}