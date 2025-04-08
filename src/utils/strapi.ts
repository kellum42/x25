import { x25log } from "./log";
import { 
  SchemaCategory, 
  Response, 
  ResponseType, 
  PersistentSchema, 
  x25Result, 
  Pagination,
  Schema
} from "./types";

const token = process.env.GATSBY_STRAPI_API_KEY;
const host = process.env.GATSBY_STRAPI_HOST;

const url = (endpoint: string): string => {
  return `${host}/api/${endpoint}`;
}

// must add pageSize and page for pagination to work.
export const get = async <TCategory extends SchemaCategory, TType extends ResponseType>(endpoint: string): Promise<x25Result<Response<TCategory, TType>>> => {
  const pageSize: number = 25;

  const _get = async (page?: number): Promise<x25Result<{result: Response<TCategory, TType>, meta?: Pagination}>> =>  {
    const _url = url(`${endpoint}&pagination[page]=${page ?? 1}&pagination[pageSize]=${pageSize}`);
    
    x25log.d("[_get][strapi.ts]: Calling endpoint %s, method: GET.", _url);
    
    const response = await fetch(_url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  
    if (!response.ok) {
      return { status: "fail", error: `HTTP error! status: ${response.status}`};
    }

    const json = await response.json();
    const data: { data: Response<TCategory, TType> } = json;
    const meta: { meta: { pagination?: Pagination }} = json;

    return { status: "success", data: { result: data.data, meta: meta.meta.pagination }};
  }

  try {
    const result = await _get();
    if ( result.status === "success" ){
      const pageCount = result.data.meta?.pageCount;
      if ( pageCount !== undefined && pageCount > 1 ){
        x25log.d("[get][strapi.ts]: GET call yielded %d pages with %d results on each page, for %d total results.", pageCount, result.data.meta?.pageSize ?? "--", result.data.meta?.total ?? "--");      

        let hasMorePages = true;
        let currentPage = 2;
        let holder: Response<TCategory, "many"> = result.data.result as Response<TCategory, "many">;

        while ( hasMorePages ){
          const res = await _get(currentPage);
    
          if ( res.status === "success" ){
            holder.push( ...res.data.result as Response<TCategory, "many">);
            // x25log.e("[get][strapi.ts]: Adding %d results from page %d.", (res.data.result as Response<TCategory, "many">).length, currentPage);

            hasMorePages = pageCount > currentPage; 
            currentPage++;

          } else {
            x25log.e("[get][strapi.ts]: Fetching page %d of %d failed. Not all results are present. Endpoint: %s.", currentPage, pageCount, endpoint);
            break;
          }  
        }
        return { status: "success", data: holder as Response<TCategory, TType> }

      } else {
        return { status: "success", data: result.data.result };
      }
    } else {
      x25log.e("[get][strapi.ts]: Failed API call. Error: %s. Endpoint: %s.", result.error, endpoint);
      return result;
    }
      
  } catch (err) {
    x25log.e("[get][strapi.ts]: An error occurred. Error: %s. Endpoint: %s.", String(err), endpoint);
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
  x25log.d("[modify][strapi.ts]: Calling endpoint %s, method: %s, body: %s.", url(endpoint), method, JSON.stringify(body));
  
  try {
    const response = await fetch(url(endpoint), {
      method,
      body: JSON.stringify(body),
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });
  
    if (!response.ok) {
      x25log.e("[modify][strapi.ts]: Call failed. Error: HTTP error status: %s.", response.status);
      return { status: "fail", error: `HTTP error! status: ${response.status}`}
    }
  
    const jsonresponse = await response.json();
    const data: { data: Response<TCategory, "one">} = jsonresponse;
    x25log.d("[modify][strapi.ts]: Call successful. Recieved: %s.", JSON.stringify(jsonresponse));
    return { status: "success", data: data.data };
  
  } catch (err) {
    x25log.e("[modify][strapi.ts]: Call failed. Error: %s.", JSON.stringify(err));
    return { status: "fail", error: `An error occurred: ${err}`}
  }
}

export const create = async <TCategory extends SchemaCategory>(endpoint: string, body: {data: CreateableSchema<TCategory>}): Promise<x25Result<Response<TCategory, "one">>> => {
  return modify(endpoint, body, "POST");
};

export const update = async <TCategory extends SchemaCategory>(endpoint: string, body: {data: UpdateableSchema<TCategory>}): Promise<x25Result<Response<TCategory, "one">>> => {
  return modify(endpoint, body, "PUT");
};

export const delete_ = async (endpoint: string): Promise<x25Result<boolean>> => {
  x25log.d("[delete_][strapi.ts]: Calling endpoint %s, method: DELETE.", url(endpoint));
  
  try {
    const response = await fetch(url(endpoint), {
      method: "DELETE",
      headers: { 'Authorization': `Bearer ${token}` }
    });
  
    if (!response.ok) {
      x25log.e("[delete][strapi.ts]: Call failed. Error: HTTP error status: %s.", response.status);
      return { status: "fail", error: `HTTP error! status: ${response.status}`}
    }
  
    // const data: { data: Response<TCategory, "one">} = await response.json();
    return { status: "success", data: true };
  
  } catch (err) {
    x25log.e("[delete_][strapi.ts]: Call failed. Error: %s.", JSON.stringify(err));
    return { status: "fail", error: `An error occurred: ${err}`}
  }
}


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


