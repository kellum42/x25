import dayjs, { Dayjs } from "dayjs"
import { useEffect, useState } from "react"
import { Schema } from "../utils/types"
import { x25log } from "../utils/log"
import { calculate, populateDates, populateOccurrences } from "../utils/occurrence";

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
  item: {
    documentId: string,
    amount: number,
    name?: string,
    frequency?: "Once" | "Weekly" | "Bi-weekly" | "Monthly"
  },
  balance?: number, // end balance
  verification?: { documentId: string, amount: number }
}

export type UseOccurrences = {
  getBalance: (on: Dayjs, day: "start" | "end") => number | null,
  getOccurrences: (from: Dayjs, to: Dayjs, order?: "asc" | "desc") => Occurrence[],
  updateItem: (item: Schema<"item">) => void,
  deleteVerification: (verification: Schema<"verification">) => void,
  addVerifications: (verification: Schema<"verification">[]) => void,
  // populateMapThrough: (date: Dayjs, items: Schema<"item">[]) => void,
  buildMap: (items: Schema<"item">[], bounds?: [Dayjs | null, Dayjs | null], verifications?: Schema<"verification">[]) => void,
  startAmount: number | undefined,
  setStartAmount: React.Dispatch<React.SetStateAction<number | undefined>>,
  map: OccurrenceMap
}

export const useOccurrences = ( fromMap?: OccurrenceMap, fromStartAmount?: number ): UseOccurrences => {
  // const context = useContext(BudgetContext);

  // if (!context) {
  //   throw new Error("Calling Budget Context from outside of provider. useOccurrences must be within provider.");
  // }

  // const { data, getItems } = context;
  // const items = getItems();
  const format = "YYYY-MM-DD";
  const [map, setMap] = useState<OccurrenceMap>( fromMap ?? {
    // bounds: [startDate.format(format), startDate.format(format)], 
    bounds: [dayjs().format(format), dayjs().format(format)],
    dates: {}
  });
  const [startAmount, setStartAmount] = useState<number>()
  const [error, setError] = useState<string>();

  useEffect(() => {
    if ( fromStartAmount !== undefined ){
      setStartAmount(fromStartAmount)
    }
  }, [])

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

  const getOccurrences = (from: Dayjs, to: Dayjs, order?: "asc" | "desc"): Occurrence[] => {
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
    return order === "desc" ? occurrences.reverse() : occurrences;
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
    if (startAmount === undefined) {
      x25log.d("[deleteVerification][useOccurrences.ts]: Start amount must be set for balances to be calculated. Run useOccurrences.setStartAmount().");
      setError("Start amount must be set for balances to be calculated. ")
      return;
    }

    if (verification.date && verification.item) {
      const datestring = verification.date;
      if (map.dates[datestring].items[verification.item.documentId] !== undefined) {
        const _map = map;
        delete _map.dates[datestring].items[verification.item.documentId].vAmount;
        delete _map.dates[datestring].items[verification.item.documentId].vId;

        x25log.d("[deleteVerification][useOccurrences.ts]: Deleted verification %s from map. Item: %s, date: %s.", verification.documentId, verification.item.documentId, datestring);
        calculate(_map, startAmount);
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
    if (startAmount === undefined) {
      x25log.d("[addVerifications][useOccurrences.ts]: Start amount must be set for balances to be calculated. Run useOccurrences.setStartAmount().");
      setError("Start amount must be set for balances to be calculated. ")
      return;
    }

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

    // if (added > 0) {
      _map = calculate(_map, startAmount);
      setMap((prevState) => ({
        ...prevState,
        dates: _map.dates
      }))
    // }
  }

  // const populateMapThrough = (date: Dayjs, items: Schema<"item">[]) => {
  //   if ( startAmount === undefined ){
  //     x25log.d("[populateMapThrough][useOccurrences.ts]: Start amount must be set for balances to be calculated. Run useOccurrences.setStartAmount().");
  //     setError("Start amount must be set for balances to be calculated. ")
  //     return;
  //   }

  //   const _map = map;

  //   // Needs update means one or more dates were added to the map.
  //   const needsUpdate = populateDatesTo(date, _map);

  //   if (needsUpdate) {
  //     populateOccurrences(items, [dayjs(map.bounds[0]), dayjs(map.bounds[1])], _map);

  //     // calculate balance
  //     calculate(_map, startAmount);

  //     setMap({
  //       ..._map,
  //       dates: _map.dates,
  //       bounds: _map.bounds
  //     });
  //   } else {
  //     x25log.d("[updateTo][useOccurrences.ts]: Changing map end date from %s - %s requires no update.", map.bounds[0], date.format("YYYY-MM-DD"));
  //   }
  // }

  const buildMap = (items: Schema<"item">[], bounds?: [Dayjs | null, Dayjs | null], verifications?: Schema<"verification">[]) => {

    let _map = map;
    const lowerBound = bounds?.[0] ?? dayjs(_map.bounds[0]);
    const upperBound = bounds?.[1] ?? dayjs(_map.bounds[1]);
    const hasDatesToProcess = populateDates(lowerBound, upperBound, _map)

    if (hasDatesToProcess) {
      if (startAmount === undefined) {
        x25log.d("[buildMap][useOccurrences.ts]: Start amount must be set for balances to be calculated. Run useOccurrences.setStartAmount().");
        setError("Start amount must be set for balances to be calculated. ")
        return;
      }

      populateOccurrences(items, [lowerBound, upperBound], _map);


      if (verifications) {
        addVerifications(verifications)

      } else {
        // calculate balance
        _map = calculate(_map, startAmount);

        setMap({
          ..._map,
          dates: _map.dates,
          bounds: _map.bounds
        });
      }

    } else {
      x25log.d("[buildMap][useOccurrences.ts]: Changing map dates from [%s,%s] to [%s,%s] requires no update.", map.bounds[0], map.bounds[1], lowerBound.format("YYYY-MM-DD"), upperBound.format("YYYY-MM-DD"));
    }
  }

  return {
    getBalance,
    getOccurrences,
    updateItem,
    deleteVerification,
    addVerifications,
    // populateMapThrough,
    buildMap,
    startAmount,
    setStartAmount,
    map
  }
}