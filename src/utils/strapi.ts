import dayjs from "dayjs";
import { Budget, BudgetItem } from "./schemas";

export type APISchemas = {
  "budget": {
    // slug: string;
    startAmount?: number;
    startDate?: string;
    title?: string;
    current?: number;
    itemCount?: number;
    items?: APISchemas["item"][];
  } & BaseAPIResponse,
  "item": {
    amount?: number;
    budget?: APISchemas["budget"];
    date?: string;
    dates?: string;
    day?: string;
    ends?: string;
    frequency?: string;
    name?: string;
    starts?: string;
    type?: 'income' | 'expense'
    verifications?: APISchemas["verification"][]
  } & BaseAPIResponse,
  "verification": {
    amount?: number;
    date?: string;
    item?: APISchemas["item"];
  } & BaseAPIResponse
}
export type APICategory = keyof APISchemas;
// export type APICategory = "budget" | "item" | "verification";
// type SingleEndpoint<TCategory extends APICategory> = `${string}/${TCategory}s${string}`;
// type PluralEndpoint<TCategory extends APICategory> = `${string}/${TCategory}s/${string}`;
// type APIEndpoint<TCategory extends APICategory, TType extends APIResponseType> = TType extends "one" ? SingleEndpoint<TCategory> : PluralEndpoint<TCategory>;
// enum Weekdays {
//   'Sunday',
//   'Monday',
//   'Tuesday',
//   'Wednesday',
//   'Thursday',
//   'Friday',
//   'Saturday',
// }
// enum Frequency {
//   'Once', 'Weekly', 'Monthly', 'Bi-weekly'
// }
type BaseAPIResponse = {
  id: string;
  documentId: string;
  publishedAt?: string;
  updatedAt?: string;
  createdAt?: string;
}

export type APIResponseSchema<TCategory extends APICategory> = APISchemas[TCategory];
export type APIResponseType = "one" | "many"
export type APIResponse<TCategory extends APICategory, TType extends APIResponseType> = TType extends "one" ? APIResponseSchema<TCategory> | null : APIResponseSchema<TCategory>[];
export type APIResult<TCategory extends APICategory = APICategory, TType extends APIResponseType = APIResponseType> = 
  { status: "success", data: APIResponse<TCategory, TType> } |
  { status: "fail", error: string }


export const get = async <TCategory extends APICategory, TType extends APIResponseType>(endpoint: string): Promise<APIResult<TCategory, TType>> => {
  const token = process.env.GATSBY_STRAPI_API_KEY;

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

export const itemTox25 = (item: APIResponseSchema<"item">): BudgetItem|null => {
  return null;
}

export const budgetTox25 = (budget: APIResponseSchema<"budget">): Budget|null => {
  const x25Budget: Budget = {
    id: budget.documentId,
    title: budget.title ?? "",
    startingBalance: budget.startAmount ?? 0,
    startDate: dayjs(budget.startDate),
    currentBalance: budget.current,
    itemCount: budget.itemCount,
    items: (budget.items ?? []).map( item => itemTox25(item)).filter( item => item !== null )
  }
  return x25Budget;
}


