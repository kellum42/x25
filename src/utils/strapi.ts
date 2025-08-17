import { x25log } from "./log";
import { 
  SchemaCategory, 
  Response, 
  ResponseType, 
  PersistentSchema, 
  x25Result, 
  Pagination,
  Schema,
  LoginResponse
} from "./types";

// const token = process.env.GATSBY_STRAPI_API_KEY;
const host = process.env.GATSBY_STRAPI_HOST;

const url = (endpoint: string): string => {
  return `${host}/api/${endpoint}`;
}

// must add pageSize and page for pagination to work.
export const get = async <TCategory extends SchemaCategory, TType extends ResponseType>(jwt: string, endpoint: string): Promise<x25Result<Response<TCategory, TType>>> => {
  const pageSize: number = 25;

  const _get = async (page?: number): Promise<x25Result<{result: Response<TCategory, TType>, meta?: Pagination}>> =>  {
    const _url = url(`${endpoint}&pagination[page]=${page ?? 1}&pagination[pageSize]=${pageSize}`);
    
    x25log.d("[_get][strapi.ts]: Calling endpoint %s, method: GET.", _url);
    
    const response = await fetch(_url, {
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' }
    });
  
    if (!response.ok) {
      return { status: "fail", error: `HTTP error! status: ${response.status}`};
    }

    const json = await response.json();

    const result: Response<TCategory, TType> = "data" in json ? json.data : json;
    const meta: Pagination|undefined = json.meta?.pagination;
    // const data: { data: Response<TCategory, TType> } = json;
    // const meta: { meta: { pagination?: Pagination }} = json;

    return { status: "success", data: { result, meta }};
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

const modify = async <TCategory extends SchemaCategory, TMethod extends "POST"|"PUT">(jwt: string, endpoint: string, body: {data: CreateableSchema<TCategory>}, method: TMethod): Promise<x25Result<Response<TCategory, "one">>> => {
  x25log.d("[modify][strapi.ts]: Calling endpoint %s, method: %s, body: %s.", url(endpoint), method, JSON.stringify(body));
  
  try {
    const response = await fetch(url(endpoint), {
      method,
      body: JSON.stringify(body),
      headers: { 'Authorization': `Bearer ${jwt}`, 'Content-Type': 'application/json' }
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

export const create = async <TCategory extends SchemaCategory>(jwt: string, endpoint: string, body: {data: CreateableSchema<TCategory>}): Promise<x25Result<Response<TCategory, "one">>> => {
  return modify(jwt, endpoint, body, "POST");
};

export const update = async <TCategory extends SchemaCategory>(jwt: string, endpoint: string, body: {data: UpdateableSchema<TCategory>}): Promise<x25Result<Response<TCategory, "one">>> => {
  return modify(jwt, endpoint, body, "PUT");
};

export const delete_ = async (jwt: string, endpoint: string): Promise<x25Result<boolean>> => {
  x25log.d("[delete_][strapi.ts]: Calling endpoint %s, method: DELETE.", url(endpoint));
  
  try {
    const response = await fetch(url(endpoint), {
      method: "DELETE",
      headers: { 'Authorization': `Bearer ${jwt}` }
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


export const login = async (user: string, password: string): Promise<x25Result<LoginResponse>> => {
  const endpoint = url("auth/local");
  const payload = {"identifier": user, "password": password};

  x25log.d("[login][strapi.ts]: Calling endpoint %s, method: POST, payload: %s.", endpoint, JSON.stringify(payload));
  
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });
  
    if (!response.ok) {
      x25log.e("[login][strapi.ts]: Call failed. Error: HTTP error status: %s.", response.status);
      return { status: "fail", error: `HTTP error! status: ${response.status}`}
    }
  
    const jsonresponse = await response.json();
    const data: LoginResponse = jsonresponse;
    x25log.d("[login][strapi.ts]: Call successful. Recieved: %s.", JSON.stringify(jsonresponse));
    return { status: "success", data: data };
  
  } catch (err) {
    x25log.e("[login][strapi.ts]: Call failed. Error: %s.", JSON.stringify(err));
    return { status: "fail", error: `An error occurred: ${err}`}
  }
} 


