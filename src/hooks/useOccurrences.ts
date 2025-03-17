import dayjs, { Dayjs } from "dayjs"
import React, { useEffect, useState } from "react"
import { Schema } from "../utils/types"
import { x25log } from "../utils/log"
// import { isMonthlyItem, isOneTimeItem, isWeeklyItem } from '../utils/util';
import { calculate, calculateOccurrences, deleteItem, populateBounds, populateOccurrences } from "../utils/occurrence";

export type OccurrenceMap = Record<string, Record<string, { amount: number, vId?: string, vAmount?: number, balance?: number }>>

export type Occurrence = {
  date: Dayjs,
  item: { documentId: string, amount: number },
  balance?: number,
  verification?: { documentId: string, amount: number }
}

export type UseOccurrences = {
  balance: (on: Dayjs, day: "start" | "end") => number | null,
  occurrences: (from: Dayjs, to: Dayjs) => Occurrence[],
  updateItem: (item: Schema<"item">) => void,
  deleteWith: (id: string, type: "item" | "verification") => void
}

export const useOccurrences = (start: Dayjs, end: Dayjs, items: Schema<"item">[]): UseOccurrences => {
  const [map, setMap] = useState<OccurrenceMap>({});
  const [bounds, setBounds] = useState<[string, string]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    // populate bounds
    const _map = populateBounds([start, end], {})
    if (_map) {
      setBounds([start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD")])

      // populate occurrences
      populateOccurrences(items, [start, end], _map);

      // calculate balance
      calculate(_map);
      setMap(_map);

    } else {
      setError("Unable to populate bounds.")
    }
  }, []);

  const balance = (on: Dayjs, day: "start" | "end" = "end"): number | null => {
    if (bounds) {
      let count = 0;
      let days = 0;
      let bal: number|null = null;

      while (count === 0 && on.subtract(days, 'days').isAfter(dayjs(bounds[0]), 'days')) {
        const datestring = on.subtract(days, 'days').format("YYYY-MM-DD");
        if (datestring in map) {
          const data = map[datestring];
          count = Object.keys(data).length;
          days++;

          if (count > 0) {
            const item = Object.keys(data)[count - 1];
            bal = data[item].balance ?? null;

            x25log.d("[balance][useOccurrences.ts]: %d ocurrences occur on %s.", count, datestring);
            Object.keys(data).map((_item,i) => {
              x25log.d("[balance][useOccurrences.ts]: Item %d/%d - id: %s, amount: $%d, balance: $%d.", i + 1, count, _item, data[_item].amount, data[_item].balance ?? 0);
            })
          
          } else {
            x25log.d("[balance][useOccurrences.ts]: %s has no occurrences. Checking previous date.", datestring);
          }
        } else {
          x25log.d("[balance][useOccurrences.ts]: %d not in map.", datestring);
        }
      }
      return bal;

    } else {
      x25log.w("[balance][useOccurrences.ts]: Could not get balance. Bounds are invalid.");
      return null;
    }

    // if (datestring in map) {
    //   const data = map[datestring];
    //   const count = Object.keys(data).length;

    //   if (count)
    //     const item = Object.keys(data)[count - 1];

    //   x25log.d("[balance][useOccurrences.ts]: Invalid date range given. From: %s, to: %s.", from.format("YYYY-MM-DD"), to.format("YYYY-MM-DD"));
    //   return data[item].balance ?? null;
    // }
    return null;
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
      if (datestring in map) {
        for (const itemId in map[datestring]) {
          const { amount, vAmount, vId, balance } = map[datestring][itemId];
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
    if (bounds) {
      const _bounds: [Dayjs, Dayjs] = [dayjs(bounds[0]), dayjs(bounds[1])];
      const _map = map;
      deleteItem(item.documentId, _map);
      populateOccurrences([item], _bounds, _map);
      calculate(_map);
      setMap(_map);

    } else {
      x25log.w("[updateItem][useOccurrences.ts]: Could not update item. Bounds are invalid.");
    }
  }

  const deleteWith = (id: string, type: "item" | "verification") => {

  }

  return {
    balance, occurrences, updateItem, deleteWith
  }
}