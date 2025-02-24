// import dayjs, { Dayjs } from "dayjs";
import { Schema } from "./strapi";
// import { Schema } from "zod";

// export type WorkableBudget = Omit<Schema<"budget">,"startDate"|"title"|"startAmount"> & { 
//   startDate: Dayjs 
//   title: string
//   startAmount: number
// }

// export type WorkableItem = 
//   Omit<(
//     Omit<Schema<"item">, "date"|"frequency"> & { date: Dayjs, frequency: "Once" } |
//     Omit<Schema<"item">, "starts"|"ends"|"day"|"frequency"> & { starts: Dayjs, ends: Dayjs|"-1", frequency: "Bi-weekly"|"Weekly", day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"} |
//     Omit<Schema<"item">, "dates"|"starts"|"ends"|"frequency"> & { dates: string[], starts: Dayjs, ends: Dayjs|"-1", frequency: "Monthly"}
//   ), "amount"|"name"|"type"> & { amount: number, name: string, type: "income"|"expense"}

// export type WorkableVerification = Omit<Schema<"verification">, "amount"|"date"> & {
//   amount: number,
//   date: Dayjs
// }

// export const asWorkableBudget = (schema: Schema<"budget">): WorkableBudget|null => {
//   if ( schema.title === undefined || schema.documentId === undefined || schema.startAmount === undefined ){
//     return null;
  
//   } else {
//     return {
//       ...schema,
//       title: schema.title,
//       startAmount: schema.startAmount,
//       startDate: dayjs(schema.startAmount)
//     }
//   }
// }

// export const asWorkableItem = (schema: Schema<"item">): WorkableItem|null => {
//   // check for basic required props.
//   if ( schema.amount === undefined || schema.name === undefined || schema.type === undefined ){
//     return null;
//   }

//   const props = { amount: schema.amount, name: schema.name, type: schema.type }

//   if ( schema.frequency === "Once" ){
//     return {
//       ...schema,
//       ...props,
//       date: dayjs(schema.date),
//       frequency: "Once"
//     }
//   } else if ( schema.frequency === "Monthly" ){
//     if ( schema.dates === undefined || schema.starts === undefined || schema.ends === undefined ){
//       return null
//     } else {
//       return {
//         ...schema,
//         ...props,
//         dates: schema.dates.split(','),
//         starts: dayjs(schema.starts),
//         ends: schema.ends === "-1" ? "-1" : dayjs(schema.ends),
//         frequency: "Monthly"
//       }
//     }
//   } else if ( schema.frequency === "Bi-weekly" || schema.frequency === "Weekly" ) {
//     if ( schema.day === undefined || schema.starts === undefined || schema.ends === undefined ){
//       return null
//     } else {
//       return {
//         ...schema,
//         ...props,
//         day: schema.day,
//         starts: dayjs(schema.starts),
//         ends: schema.ends === "-1" ? "-1" : dayjs(schema.ends),
//         frequency: schema.frequency
//       }
//     }
//   }
//   return null;
// }

// export const asWorkableVerification = (schema: Schema<"verification">): WorkableVerification|null => {
//   if ( schema.amount === undefined || schema.date === undefined ){
//     return null;
//   } else {
//     return {
//       ...schema,
//       amount: schema.amount,
//       date: dayjs(schema.date)
//     }
//   }
// }

export const isGoodBudget = (schema: Schema<"budget">): boolean => {
  if ( 
    schema.startAmount === undefined ||
    schema.startDate === undefined ||
    schema.title === undefined
  ){
    return false;
  }
  return true;
}

export const isGoodVerification = (schema: Schema<"verification">): boolean => {
  return schema.amount !== undefined && schema.date !== undefined;
}

export const isGoodItem = (schema: Schema<"item">): boolean => {
  if ( 
    typeof schema.amount === undefined ||
    typeof schema.frequency === undefined ||
    typeof schema.name === undefined ||
    typeof schema.type === undefined
   ){
    return false;
  }

  if ( schema.frequency === "Once" ){
    if ( schema.date === undefined ){ return false; }
  
  } else if ( schema.frequency === "Monthly" ){
    if ( 
      schema.dates === undefined || 
      schema.starts === undefined || 
      schema.ends === undefined 
    ){
      return false;
    }
  
  } else {
    if ( 
      schema.day === undefined || 
      schema.starts === undefined || 
      schema.ends === undefined 
    ){
      return false;
    }
  }
  return true;
}


