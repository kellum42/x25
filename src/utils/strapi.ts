import dayjs from "dayjs";
import { Budget, BudgetItem } from "./schemas";


type BaseSchema = {
  id: string;
  documentId: string;
  publishedAt?: string;
  updatedAt?: string;
  createdAt?: string;
}

type PersistentSchema = {
  "budget": {
    startAmount?: number;
    startDate?: string;
    title?: string;
    items?: Schemas["item"][];
    parent?: Schemas["budget"]
  },
  "item": {
    amount?: number;
    frequency?: "Once" | "Weekly" | "Bi-weekly" | "Monthly";
    name?: string;
    type?: 'income' | 'expense';
    date?: string;
    dates?: string;
    day?: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
    starts?: string;
    ends?: string;
    budget?: Schemas["budget"];
    verifications?: Schemas["verification"][]
  },
  "verification": {
    amount?: number;
    date?: string;
    item?: Schemas["item"];
  }
}

type NonPersistentSchema = {
  "budget": {
    // current?: number;
    // startOfWeek?: number;
    // itemCount?: number;
  },
  "item": {},
  "verification": {}
}

export type Schemas = {
  "budget": BaseSchema & PersistentSchema["budget"],
  "item": BaseSchema & PersistentSchema["item"],
  "verification": BaseSchema & PersistentSchema["verification"]
}

export type SchemaCategory = keyof Schemas;
export type Schema<TCategory extends SchemaCategory> = Schemas[TCategory];
export type ResponseType = "one" | "many"
export type Response<TCategory extends SchemaCategory, TType extends ResponseType> = TType extends "one" ? Schema<TCategory> | null : Schema<TCategory>[];
export type x25Result<T> = { status: "success", data: T } | { status: "fail", error: string }

const token = process.env.GATSBY_STRAPI_API_KEY;

export const get = async <TCategory extends SchemaCategory, TType extends ResponseType>(endpoint: string): Promise<x25Result<Response<TCategory, TType>>> => {
  try {
    const response = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  
    if (!response.ok) {
      return { status: "fail", error: `HTTP error! status: ${response.status}`}
    }
  
    const data: { data: Response<TCategory, TType>} = await response.json();
    return { status: "success", data: data.data };
  
  } catch (err) {
    return { status: "fail", error: `An error occurred: ${err}`}
  }
}

// Makes relations on any Schema a string. 
export type CreateableSchema<TCategory extends keyof PersistentSchema> = Required<{
  [P in keyof PersistentSchema[TCategory]]: P extends keyof PersistentSchema 
    ? string
    : PersistentSchema[TCategory][P]
}>
export type UpdateableSchema<TCategory extends SchemaCategory> = CreateableSchema<TCategory>;

const modify = async <TCategory extends SchemaCategory, TMethod extends "POST"|"PUT">(endpoint: string, body: {data: CreateableSchema<TCategory>}, method: TMethod): Promise<x25Result<Response<TCategory, "one">>> => {
  try {
    const response = await fetch(endpoint, {
      method,
      body: JSON.stringify(body),
      headers: { 'Authorization': `Bearer ${token}` }
    });
  
    if (!response.ok) {
      return { status: "fail", error: `HTTP error! status: ${response.status}`}
    }
  
    const data: { data: Response<TCategory, "one">} = await response.json();
    return { status: "success", data: data.data };
  
  } catch (err) {
    return { status: "fail", error: `An error occurred: ${err}`}
  }
}
export const create = async <TCategory extends SchemaCategory>(endpoint: string, body: {data: CreateableSchema<TCategory>}): Promise<x25Result<Response<TCategory, "one">>> => {
  return modify(endpoint, body, "POST");
};
export const update = async <TCategory extends SchemaCategory>(endpoint: string, body: {data: UpdateableSchema<TCategory>}): Promise<x25Result<Response<TCategory, "one">>> => {
  return modify(endpoint, body, "PUT");
};


// export const itemTox25 = (item: APISchemas["item"]): BudgetItem|null => {
//   if ( 
//     item.frequency !== undefined &&
//     item.amount !== undefined &&
//     item.type !== undefined &&
//     item.name !== undefined
//   ){
//       const base = {
//         id: item.documentId,
//         name: item.name,
//         amount: item.amount,
//         type: item.type,
//       }
//       if ( item.frequency === "Once"){
//         const x25Item: BudgetItem = {
//           ...base, 
//           frequency: "Once", 
//           date: dayjs(item.date) 
//         };
//         return x25Item;
      
//       } else {
//         if ( item.frequency === "Monthly"){
//           const x25Item: BudgetItem = {
//             ...base, 
//             frequency: "Monthly", 
//             starts: dayjs(item.starts), 
//             ends: item.ends === "-1" ? "-1" : dayjs(item.ends),
//             dates: (item.dates ?? "").split(",")
//           } 
//           return x25Item;

//         } else {
//           const x25Item: BudgetItem = {
//             ...base, 
//             frequency: item.frequency,
//             starts: dayjs(item.starts), 
//             ends: item.ends === "-1" ? "-1" : dayjs(item.ends),
//             day: item.day ?? "Friday"
//           }
//           return x25Item; 
//         }
//       }
//   }  
//   return null;
// }

// export const budgetTox25 = (budget: BudgetAPIResponse): Budget|null => {
//   const x25Budget: Budget = {
//     id: budget.documentId,
//     title: budget.title ?? "",
//     startingBalance: budget.startAmount ?? 0,
//     startDate: dayjs(budget.startDate),
//     currentBalance: budget.current,
//     startOfWeekBalance: budget.startOfWeek,
//     itemCount: budget.itemCount,
//     items: (budget.items ?? []).map( item => itemTox25(item)).filter( item => item !== null ),
//     // notes: undefined,
//     // createDate: undefined,
//     // parent: undefined,
//     // changes: undefined,
//     // avatar: undefined
//   }
//   return x25Budget;
// }


