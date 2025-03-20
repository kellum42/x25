import dayjs, { Dayjs } from "dayjs"
import React, { useEffect, useState } from "react"
import { Schema } from "../utils/types"
import { x25log } from "../utils/log"
// import { isMonthlyItem, isOneTimeItem, isWeeklyItem } from '../utils/util';
import { calculate, calculateOccurrences, deleteItem, populateBounds, populateOccurrences } from "../utils/occurrence";

// export type OccurrenceMap = Record<string, Record<string, { amount: number, vId?: string, vAmount?: number, balance?: number }>>
export type OccurrenceMap = {
  bounds?: [string, string],
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
  balance?: number,
  verification?: { documentId: string, amount: number }
}

export type UseOccurrences = {
  balance: (on: Dayjs, day: "start" | "end", startBalance?: number) => number | null,
  occurrences: (from: Dayjs, to: Dayjs) => Occurrence[],
  updateItem: (item: Schema<"item">) => void,
  deleteWith: (id: string, type: "item" | "verification") => void,
  addVerifications: (verification: Schema<"verification">[]) => void,
  updateBounds: (bounds: [Dayjs, Dayjs]) => void
}

export const useOccurrences = (start: Dayjs, end: Dayjs, items: Schema<"item">[]): UseOccurrences => {
  const [map, setMap] = useState<OccurrenceMap>({ dates: {} });
  // const [bounds, setBounds] = useState<[string, string]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    // populate bounds
    if (end.isBefore(start, 'days')) {
      x25log.w("[useEffect][useOccurrences.ts]: Lower bound %s is after upper bound %s.", start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"));

    } else {
      // const _map = populateBounds([start, end], {})
      // setBounds([start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD")])

      // // populate occurrences
      // populateOccurrences(items, [start, end], _map);

      // // calculate balance
      // calculate(_map);
      // setMap(_map);

      let _map = map;
      _map = populateBounds([start, end], _map);
      _map = populateOccurrences(items, [start, end], _map);

      // calculate balance
      _map = calculate(_map);
      setMap(_map);
    }
  }, []);


  // useEffect(() => {
  //   if (bounds !== undefined) {
  //     x25log.i("[useEffect][useOccurrences.ts]: Bounds updated to %s - %s.", bounds[0], bounds[1]);

  //     // populate occurrences
  //     let _map = map;
  //     _map = populateBounds([dayjs(bounds[0]), dayjs(bounds[1])], _map);
  //     _map = populateOccurrences(items, [dayjs(bounds[0]), dayjs(bounds[1])], _map);

  //     // calculate balance
  //     _map = calculate(_map);
  //     setMap(_map);
  //   }

  // }, [bounds])


  const balance = (on: Dayjs, day: "start" | "end", startBalance?: number): number | null => {
    const datestring = on.format("YYYY-MM-DD");
    if (datestring in map.dates) {
      const data = map.dates[datestring];
      const balance = day === "start" ? data.sbal : data.bal;
      return balance !== undefined ? balance + (startBalance ?? 0) : null;
    }
    return null;
    // if (bounds) {
    //   // zero out everything but year, month, date.
    //   const _on = on.set('hours', 0).set('minutes', 0).set('millisecond', 0);

    //   let count = 0;
    //   let days = 0;
    //   let bal: number | null = null;

    //   const lower = dayjs(bounds[0]);
    //   const upper = dayjs(bounds[1]);

    //   // check if date is outside of bounds.
    //   if (_on.isBefore(lower, 'days') || _on.isAfter(upper, 'days')) {
    //     x25log.w("[balance][useOccurrences.ts]: %s is outside of bounds %s - %s. Call maybeUpdateBounds before this.", _on.format("YYYY-MM-DD"), bounds[0], bounds[1]);
    //     return null;
    //   }

    //   // days < 365 is a fail safe.
    //   // If there is no occurrence on the given day, go back until we find most recent occurrence.
    //   while (count === 0 && on.subtract(days, 'days').isAfter(lower) && days < 365) {
    //     const datestring = on.subtract(days, 'days').format("YYYY-MM-DD");
    //     if (datestring in map) {
    //       const data = map[datestring];
    //       count = Object.keys(data).length;

    //       if (count > 0) {
    //         const item = Object.keys(data)[count - 1];
    //         bal = data[item].balance ?? null;

    //         x25log.d("[balance][useOccurrences.ts]: %d ocurrences occur on %s.", count, datestring);
    //         Object.keys(data).map((_item, i) => {
    //           x25log.d("[balance][useOccurrences.ts]: Item %d/%d - id: %s, amount: $%d, balance: $%d.", i + 1, count, _item, data[_item].amount, data[_item].balance ?? 0);
    //         })

    //       } else {
    //         x25log.d("[balance][useOccurrences.ts]: %s has no occurrences. Checking previous date.", datestring);
    //       }
    //     } else {
    //       x25log.d("[balance][useOccurrences.ts]: %s not in map.", datestring);
    //     }
    //     days++;
    //   }
    //   if (bal !== null && startBalance !== undefined) {
    //     return bal + startBalance;
    //   } else {
    //     return bal;
    //   }

    // } else {
    //   x25log.w("[balance][useOccurrences.ts]: Bounds are undefined. Could not get balance.");
    //   return null;
    // }
  }

  const occurrences = (from: Dayjs, to: Dayjs): Occurrence[] => {
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

  const deleteWith = (id: string, type: "item" | "verification") => {

  }

  const addVerifications = (verifications: Schema<"verification">[]) => {
    let _map = map;
    let added: number = 0;

    verifications.map(verification => {
      const date = verification.date;
      const amount = verification.amount;
      const item = verification.item;

      if (date !== undefined && amount !== undefined && item !== undefined) {
        const multiplier = amount > 0 ? 1 : -1;

        if (date in _map.dates && item.documentId in _map.dates[date].items) {
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

    if ( added > 0){
      _map = calculate(_map);
      setMap(_map);
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

  const updateBounds = (bounds: [Dayjs, Dayjs]) => {
    // const lower = map.bounds === undefined || bounds[0].isBefore(dayjs(map.bounds[0]), 'date') ? bounds[0] : dayjs(map.bounds[0]);
    // const upper = map.bounds === undefined || bounds[1].isAfter(dayjs(map.bounds[1]), 'date') ? bounds[1] : dayjs(map.bounds[1]);
    let lower: Dayjs;
    let upper: Dayjs;
    let update: boolean = false;

    if (map.bounds === undefined || bounds[0].isBefore(dayjs(map.bounds[0]), 'date')) {
      lower = bounds[0];
      update = true;
    } else {
      lower = dayjs(map.bounds[0]);
    }

    if (map.bounds === undefined || bounds[1].isAfter(dayjs(map.bounds[1]), 'date')) {
      upper = bounds[1];
      update = true;
    } else {
      upper = dayjs(map.bounds[1]);
    }

    if (update) {
      let _map = map;
      _map = populateBounds([lower, upper], _map);
      _map = populateOccurrences(items, [lower, upper], _map);

      // calculate balance
      _map = calculate(_map);

      setMap({
        ..._map,
        bounds: [lower.format("YYYY-MM-DD"), upper.format("YYYY-MM-DD")]
      });
    } else {
      x25log.d("[updateBounds][useOccurrences.ts]: Changing bounds from %s-%s to %s-%s requires no update.", (map.bounds ?? ["null"])[0], (map.bounds ?? ["null"])[0], bounds[0].format("YYYY-MM-DD"), bounds[1].format("YYYY-MM-DD"));
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
    balance, occurrences, updateItem, deleteWith, addVerifications, updateBounds
  }
}