import dayjs, { Dayjs } from "dayjs"
import React, { useContext, useEffect, useState } from "react"
import { Schema } from "../utils/types"
import { x25log } from "../utils/log"
// import { isMonthlyItem, isOneTimeItem, isWeeklyItem } from '../utils/util';
import { calculate, calculateOccurrences, deleteItem, populateDatesTo, populateOccurrences } from "../utils/occurrence";
import { BudgetContext } from "../contexts/budgetContext";

// export type OccurrenceMap = Record<string, Record<string, { amount: number, vId?: string, vAmount?: number, balance?: number }>>
export type OccurrenceMap = {
  bounds: [string, string],
  dates: Record<
    string,
    {
      bal?: number,
      sbal?: number,
      items: Record<
        string,
        { amount: number, vId?: string, vAmount?: number }
      >
    }
  >
}

export type Occurrence = {
  date: Dayjs,
  item: { documentId: string, amount: number },
  balance?: number, // end balance
  verification?: { documentId: string, amount: number }
}

export type UseOccurrences = {
  getBalance: (on: Dayjs, day: "start" | "end", startBalance?: number) => number | null,
  getOccurrences: (from: Dayjs, to: Dayjs) => Occurrence[],
  updateItem: (item: Schema<"item">) => void,
  deleteVerification: (verification: Schema<"verification">) => void,
  addVerifications: (verification: Schema<"verification">[]) => void,
  updateTo: (date: Dayjs) => void,
  // getThisWeek: ()
}

export const useOccurrences = (): UseOccurrences => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider. useOccurrences must be within provider.");
  }

  const { data, getItems } = context;
  const items = getItems();
  const format = "YYYY-MM-DD";
  const [map, setMap] = useState<OccurrenceMap>({ 
    bounds: [data.startDate.format(format), data.startDate.format(format)], 
    dates: {} 
  });
  // const [bounds, setBounds] = useState<[string, string]>();
  const [error, setError] = useState<string>();

  // useEffect(() => {
  //   // populate bounds
  //   if (end.isBefore(data.startDate, 'days')) {
  //     x25log.w("[useEffect][useOccurrences.ts]: End date %s is before the budget starts %s. End date must be after the budget begins.", end.format("YYYY-MM-DD"), data.startDate.format("YYYY-MM-DD"));

  //   } else {
  //     let _map = map;
  //     _map = populateDatesTo(end, _map);
  //     _map = populateOccurrences(items, [data.startDate, end], _map);

  //     // calculate balance
  //     _map = calculate(_map, data.startAmount);
  //     setMap(_map);
  //   }
  // }, []);

  useEffect(() => {
    x25log.d("[useEffect][useOccurrences.ts]: Map was set. Bounds are %s - %s.", map.bounds?.[0] ?? "null", map.bounds?.[1] ?? "null");
  }, [map])


  const getBalance = (on: Dayjs, day: "start" | "end"): number | null => {
    const datestring = on.format("YYYY-MM-DD");
    if (datestring in map.dates) {
      const data = map.dates[datestring];
      const balance = day === "start" ? data.sbal : data.bal;
      return balance ?? null
    }
    return null;
  }

  const getOccurrences = (from: Dayjs, to: Dayjs): Occurrence[] => {
    if (from.isAfter(to, 'day')) {
      x25log.e("[occurrences][useOccurrences.ts]: Invalid date range given. From: %s, to: %s.", from.format("YYYY-MM-DD"), to.format("YYYY-MM-DD"));
      return []
    }

    const occurrences: Occurrence[] = [];
    let date = from;

    while (!date.isAfter(to, 'day')) {
      const datestring = date.format("YYYY-MM-DD");
      if (datestring in map.dates) {
        // calculate balance for at each occurrence.
        const startBal: number | undefined = map.dates[datestring].sbal;
        let daySum: number = 0;

        for (const itemId in map.dates[datestring].items) {
          const { amount, vAmount, vId } = map.dates[datestring].items[itemId];
          daySum += vAmount ?? amount;
          const balance = startBal !== undefined ? startBal + daySum : undefined;
          const occ: Occurrence = { item: { documentId: itemId, amount }, date, balance };
          if (vAmount !== undefined && vId !== undefined) {
            occ.verification = { documentId: vId, amount: vAmount }
          }
          occurrences.push(occ)
        }
      }
      date = date.add(1, 'day');
    }
    return occurrences;
  }

  const updateItem = (item: Schema<"item">) => {
    // if (bounds) {
    //   const _bounds: [Dayjs, Dayjs] = [dayjs(bounds[0]), dayjs(bounds[1])];
    //   const _map = map;
    //   deleteItem(item.documentId, _map);
    //   populateOccurrences([item], _bounds, _map);
    //   calculate(_map);
    //   setMap(_map);

    // } else {
    //   x25log.w("[updateItem][useOccurrences.ts]: Could not update item. Bounds are invalid.");
    // }
  }

  const deleteVerification = (verification: Schema<"verification">) => {
    if (verification.date && verification.item) {
      const datestring = verification.date;
      if (map.dates[datestring].items[verification.item.documentId] !== undefined) {
        const _map = map;
        delete _map.dates[datestring].items[verification.item.documentId].vAmount;
        delete _map.dates[datestring].items[verification.item.documentId].vId;

        x25log.d("[deleteVerification][useOccurrences.ts]: Deleted verification %s from map. Item: %s, date: %s.", verification.documentId, verification.item.documentId, datestring);
        calculate(_map, data.startAmount);
        // setMap(_map);
        setMap((prevState) => ({
          ...prevState,
          dates: _map.dates
        }))
      } else {
        x25log.w("[deleteVerification][useOccurrences.ts]: Unable to delete verification %s, it does not exist in map.", verification.documentId);
      }
    } else {
      x25log.w("[deleteVerification][useOccurrences.ts]: Unable to delete verification. Missing date or item on verification %s.", verification.documentId);
    }
  }

  const addVerifications = (verifications: Schema<"verification">[]) => {
    let _map = map;
    let added: number = 0;

    verifications.map(verification => {
      const date = verification.date;
      const amount = verification.amount;
      const item = verification.item;

      if (date !== undefined && amount !== undefined && item !== undefined) {

        if (date in _map.dates && item.documentId in _map.dates[date].items) {
          const multiplier = _map.dates[date].items[item.documentId].amount < 0 ? -1 : 1;
          _map.dates[date].items[item.documentId].vId = verification.documentId;
          _map.dates[date].items[item.documentId].vAmount = multiplier * amount;
          added++;

        } else {
          x25log.w("[addVerification][useOccurrences.ts]: Occurrence is missing for verification %s. This should not happen. date: %s, item: %s.", verification.documentId, date, item.documentId);
        }

      } else {
        x25log.d("[addVerification][useOccurrences.ts]: Could not add verification %s because it is missing data.", verification.documentId);
      }
    });

    x25log.d("[addVerification][useOccurrences.ts]: Added %d/%d verifications to map.", added, verifications.length);

    if (added > 0) {
      _map = calculate(_map, data.startAmount);
      // setMap(_map);
      setMap((prevState) => ({
        ...prevState,
        dates: _map.dates
      }))
    }

    // if ( )
    //   if (verification.date === undefined || verification.amount === undefined) {
    //     x25log.d("[verify][useOccurrences.ts]: Could not verify %s for item %s. No date and/or amount was given.", verification.documentId, item);

    //   } else {
    //     if (verification.date in map && item in map[verification.date]) {
    //       const _map = map;
    //       const multiplier = _map[verification.date][item].amount < 0 ? -1 : 1;

    //       _map[verification.date][item].vId = verification.documentId;
    //       _map[verification.date][item].vAmount = verification.amount * multiplier

    //       calculate(_map);
    //       setMap(_map);
    //     } else {
    //       x25log.d("[verify][useOccurrences.ts]: There is no occurrence for item %s on %s. Could not create verification.", item, verification.date);
    //     }
    //   }
  }

  const updateTo = (date: Dayjs) => {
    // const lower = map.bounds === undefined || bounds[0].isBefore(dayjs(map.bounds[0]), 'date') ? bounds[0] : dayjs(map.bounds[0]);
    // const upper = map.bounds === undefined || bounds[1].isAfter(dayjs(map.bounds[1]), 'date') ? bounds[1] : dayjs(map.bounds[1]);
    // let lower: Dayjs;
  
    // if (map.bounds === undefined || bounds[0].isBefore(dayjs(map.bounds[0]), 'date')) {
    //   lower = bounds[0];
    //   update = true;
    // } else {
    //   lower = dayjs(map.bounds[0]);
    // }

    // if (map.bounds === undefined || bounds[1].isAfter(dayjs(map.bounds[1]), 'date')) {
    //   upper = bounds[1];
    //   update = true;
    // } else {
    //   upper = dayjs(map.bounds[1]);
    // }
    const _map = map;
    const needsUpdate = populateDatesTo(date, _map);

    if (needsUpdate) {
      // let _map = map;
      // _map = populateBounds([lower, upper], _map);
      populateOccurrences(items, [dayjs(map.bounds[0]), dayjs(map.bounds[1])], _map);

      // calculate balance
      calculate(_map, data.startAmount);

      setMap({
        ..._map,
        dates: _map.dates,
        bounds: _map.bounds
      });
    } else {
      x25log.d("[updateTo][useOccurrences.ts]: Changing map end date from %s - %s requires no update.", map.bounds[0], date.format("YYYY-MM-DD"));
    }

    // populateOccurrences(items,[lower, upper], map)
    // if (lower === undefined && upper === undefined) {
    //   x25log.w("[maybeUpdateBounds][useOccurrences.ts]: Can't update bounds. Both lower and upper bounds args are undefined.");
    //   return;
    // }

    // if (bounds === undefined) {
    //   // if ( lower !== undefined && upper !== undefined ){
    //   //   setBounds([lower, upper]);
    //   //   return;
    //   // }
    //   x25log.w("[maybeUpdateBounds][useOccurrences.ts]: Could not update bounds. New bounds are invalid.");
    //   return;
    // }

    // let update = false;
    // let _lower = bounds[0];
    // let _upper = bounds[1];
    // if (lower !== undefined && dayjs(lower).isBefore(dayjs(_lower))) {
    //   _lower = lower;
    //   update = true;
    // }

    // if (upper !== undefined && dayjs(upper).isAfter(dayjs(_upper))) {
    //   _upper = upper;
    //   update = true;
    // }

    // if (update) {
    //   setBounds([_lower, _upper]);
    //   // x25log.i("[maybeUpdateBounds][useOccurrences.ts]: Bounds updated to %s - %s.", _lower, _upper);

    //   let _map = map;
    //   _map = populateBounds([dayjs(_lower), dayjs(_upper)], _map);
    //   _map = populateOccurrences(items, [dayjs(_lower), dayjs(_upper)], _map);

    //   // calculate balance
    //   _map = calculate(_map);
    //   setMap(_map);
    // }
  }

  return {
    getBalance, getOccurrences, updateItem, deleteVerification, addVerifications, updateTo
  }
}