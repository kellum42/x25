import { useState } from "react";
import { saveBudgetItem } from "../utils/localStorage";
import { BudgetLineItemFrequency, WeeklyBudgetLineItemDays } from "./useBudgetDetails";
import dayjs from "dayjs";

export const useAddNewBudgetItem = (): {
  fields: { name: string, amount: string, type: string, frequency: string, starts: string, ends: string, date: string, dates: string, day: string },
  loading: boolean,
  error: string | null,
  screen: 0 | 1,
  save: () => void,
  next: () => void,
  back: () => void,
  update: (name: string, value?: string) => void
} => {
  // save()
  // error
  // fields
  // next()
  // loading
  // screen

  const [fields, setFields] = useState({
    name: "",
    amount: "",
    type: "expense",
    frequency: "Once",
    starts: "",
    ends: "-1",
    dates: "1",
    date: "",
    day: "Friday"
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [screen, setScreen] = useState<0 | 1>(0);

  const update = (name: string, value?: string ) => {
    if (value !== undefined) {
      if (name === "type") {
        if ("income" !== value && "expense" !== value) { return; }
      }

      setFields((prevState) => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const validate = () => {
    if ( !fields.name || fields.name.length > 2 ){
      setError( "Invald name" );
    }
    if ( !fields.type || ![ "income", "expense" ].includes( fields.type )){
      setError( "Invalid type." );
    }
    if ( !fields.frequency || !Object.keys( BudgetLineItemFrequency ).includes( fields.frequency )){
      setError( "Invalid frequency." );
    }
    if ( fields.frequency === BudgetLineItemFrequency.Once ){
      if ( fields["date"] === undefined ){
        setError( "Date is required." );
      }
    } else {
      if ( fields[ "starts" ] === undefined || !fields[ "starts" ]){
        setError( "Start date is required." ); return;
      }
      if ( fields[ "ends" ] === undefined || !fields[ "ends" ]){
        setError( "End date is required." ); return;
      }
      if ( fields.ends !== "-1" && dayjs( fields.starts ).isAfter( dayjs( fields.ends ) )){
        setError( "Invalid range given." );
      }
      if ( fields.frequency === BudgetLineItemFrequency.Monthly ){
        if ( fields[ "dates" ] === undefined || !fields[ "dates" ]){
          setError( "Dates is required." );
        }
      }
      if ( fields.frequency === BudgetLineItemFrequency.Weekly || fields.frequency === BudgetLineItemFrequency.Biweekly ){
        if ( fields[ "day" ] === undefined || !Object.keys( WeeklyBudgetLineItemDays ).includes( fields.day )){
          setError( "Day is required." );
        }
      }
    }
    return error === null
  }

  const save = ( slug: string ) => {
    // console.log(fields);
    validate();

    if ( error === null ){
      saveBudgetItem( slug, );
    }

    // try {
    //   const _item = inputs;
    //   _item.id = getUniqueID();
    //   const item = JSON.parse(JSON.stringify(_item));
    //   // Parse dayjs.

    //   if (item.frequency === BudgetLineItemFrequency.Once) {
    //     item.date = dayjs(item.date);

    //   } else {
    //     item.starts = dayjs(item.starts);
    //     item.ends = item.ends === -1 ? -1 : dayjs(item.ends);
    //   }

    //   const goodItem: BudgetLineItem = item as BudgetLineItem;
    //   console.log(goodItem);

    // } catch (e) {
    //   if (typeof e === "string") {
    //     console.log(e);

    //   } else if (e instanceof Error) {
    //     console.log( e.message );

    //   } else {
    //     console.log( "An unknown error occurred getting the budgets." );
    //   }
    // }
  };

  const next = () => {
    setScreen(1);
  };

  const back = () => {
    setScreen(0);
  };

  return { fields, loading, error, screen, save, next, back, update };
};