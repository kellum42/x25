import dayjs from "dayjs";
import { Budget, BudgetItem } from "./schemas";

export type APISchemas = {
  "budget": BaseAPIResponse & {
    startAmount?: number;
    startDate?: string;
    title?: string;
    current?: number;
    startOfWeek?: number;
    itemCount?: number;
    items?: APISchemas["item"][];
    parent?: APISchemas["budget"]
  },
  "item": BaseAPIResponse & {
    amount?: number;
    frequency?: "Once" | "Weekly" | "Bi-weekly" | "Monthly";
    name?: string;
    type?: 'income' | 'expense';
    date?: string;
    dates?: string;
    day?: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
    starts?: string;
    ends?: string;
    budget?: APISchemas["budget"];
    verifications?: APISchemas["verification"][]
  },
  "verification": BaseAPIResponse & {
    amount?: number;
    date?: string;
    item?: APISchemas["item"];
  }
}

type BaseAPIResponse = {
  id: string;
  documentId: string;
  publishedAt?: string;
  updatedAt?: string;
  createdAt?: string;
}

export type APICategory = keyof APISchemas;

// type BudgetAPIResponse = BaseAPIResponse & APISchemas["budget"] & {
//   current?: number;
//   startOfWeek?: number;
//   itemCount?: number;
// }
// type ItemAPIResponse = BaseAPIResponse & APISchemas["item"] & {
//   date?: string;
//   dates?: string;
//   day?: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
//   starts?: string;
//   ends?: string;
// }



export type APIResponseSchema<TCategory extends APICategory> = APISchemas[TCategory];
export type APIResponseType = "one" | "many"
export type APIResponse<TCategory extends APICategory, TType extends APIResponseType> = TType extends "one" ? APIResponseSchema<TCategory> | null : APIResponseSchema<TCategory>[];
export type APIResult<TCategory extends APICategory = APICategory, TType extends APIResponseType = APIResponseType> = 
  { status: "success", data: APIResponse<TCategory, TType> } |
  { status: "fail", error: string }



const token = process.env.GATSBY_STRAPI_API_KEY;

export const get = async <TCategory extends APICategory, TType extends APIResponseType>(endpoint: string): Promise<APIResult<TCategory, TType>> => {
  try {
    const response = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  
    if (!response.ok) {
      return { status: "fail", error: `HTTP error! status: ${response.status}`}
    }
  
    const data: { data: APIResponse<TCategory, TType>} = await response.json();
    return { status: "success", data: data.data };
  
  } catch (err) {
    return { status: "fail", error: `An error occurred: ${err}`}
  }
}

const modify = async <TCategory extends APICategory, TMethod extends "POST"|"PUT">(endpoint: string, body: {data: Required<APISchemas[TCategory]>}, method: TMethod): Promise<APIResult<TCategory, "one">> => {
  try {
    const response = await fetch(endpoint, {
      method,
      body: JSON.stringify(body),
      headers: { 'Authorization': `Bearer ${token}` }
    });
  
    if (!response.ok) {
      return { status: "fail", error: `HTTP error! status: ${response.status}`}
    }
  
    const data: { data: APIResponse<TCategory, "one">} = await response.json();
    return { status: "success", data: data.data };
  
  } catch (err) {
    return { status: "fail", error: `An error occurred: ${err}`}
  }
}
export const create = async <TCategory extends APICategory>(endpoint: string, body: {data: Required<APISchemas[TCategory]>}) => {
  return modify(endpoint, body, "POST");
};
export const update = async <TCategory extends APICategory>(endpoint: string, body: {data: Required<APISchemas[TCategory]>}) => {
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


