import React, { useEffect, useState, MouseEvent } from "react";
import { Schema } from "../../utils/types";
import { Dayjs } from "dayjs";
import { ManageItemsFilter, ManageItemsFilterType } from "./manage-items-filter";
import { isActive } from "../../utils/util";
import { x25log } from "../../utils/log";
import { ManageItemsSearch } from "./manage-items-search";
import { ManageItemsSort } from "./manage-items-sort";
import { ManageItemRow } from "./manage-item-row";
import { UpdateBudgetItem } from "../modals/update-budget-item-modal";
import { NewBudgetItemModal } from "../modals/new-budget-item-modal";

type ManageItemsProps = {
  items: Schema<"item">[],
  date: Dayjs
}

export const ManageItems: React.FC<ManageItemsProps> = (props) => {
  const initialFn = (): (items: Schema<"item">[]) => Schema<"item">[] => {
    return (items: Schema<"item">[]) => items;
  }

  const [searchFn, setSearchFn] = useState<((items: Schema<"item">[]) => Schema<"item">[])>(initialFn);
  const [filtersFn, setFiltersFn] = useState<((items: Schema<"item">[]) => Schema<"item">[])>(initialFn);;
  const [sortFn, setSortFn] = useState<((items: Schema<"item">[]) => Schema<"item">[])>(initialFn);;
  // const [openItem, setOpenItem] = useState<number>();
  const [results, setResults] = useState<Schema<"item">[]>(props.items);
  const [isCreatingItem, setIsCreatingItem] = useState<boolean>(false);

  const count = results.length;

  const onSearch = (search: string) => {
    const term = search.toLowerCase();
    
    const fn = () => (items: Schema<"item">[]): Schema<"item">[] => {
      return items.filter( item => (item.name ?? "").toLowerCase().includes(term) )
    }
    setSearchFn(fn);
  }

  // convert filters to a function that can be used.
  const onFilter = (filter: ManageItemsFilterType) => {
    const map: { [K in keyof ManageItemsFilterType["frequency"]]: Schema<"item">["frequency"] } = { once: "Once", weekly: "Weekly", biweekly: "Bi-weekly", monthly: "Monthly" }
    const frequencies: Schema<"item">["frequency"][] =
      Object.keys(filter.frequency)
        .filter(f => filter.frequency[f as keyof ManageItemsFilterType["frequency"]]) // get frequencies set to true
        .map(f => map[f as keyof ManageItemsFilterType["frequency"]]) // convert to Schema<"item">["frequency"]

    const fn = () => (items: Schema<"item">[]): Schema<"item">[] => {
      let res = items.filter(item => frequencies.includes(item.frequency));
      res = res.filter(r => {
        const active: boolean = isActive(props.date, r)
        return filter.state === 'inactive' ? !active : active;
      })
      x25log.d("[onFilter][items.tsx]: Filtered %d items to %d.", items.length, res.length);
      return res;
    }

    setFiltersFn(fn);
  }

  const onSort = (sort: "asc" | "desc") => {
    const fn = () => (items: Schema<"item">[]): Schema<"item">[] => {
      return items.sort((a, b) => {
        if (a.amount === undefined || b.amount === undefined || a.amount === b.amount) {
          return 0;
        } else {
          return (a.amount > b.amount ? 1 : -1) * (sort === "asc" ? -1 : 1);
        }
      })
    }
    setSortFn(fn);
  }

  const onOpen = () => {

  }

  const onNewItemClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // console.log("new item button click")
    setIsCreatingItem( true );
  }

  const query = () => {
    let items = props.items;
    items = filtersFn(items);
    items = searchFn(items);
    items = sortFn(items);
    setResults(items);
  }

  useEffect(() => {
    query();
  }, [searchFn, filtersFn, sortFn])

  useEffect(() => {
    query();
  }, [props.items])

  return (
    <div className="">
      <h3 className="m-0 mb-6 text-gray-900">Manage</h3>
      <p className="text-muted">Create, edit, and analyze budget items.</p>
      <div>
        <ManageItemsSearch onChange={onSearch} />
        <div>
          <ManageItemsFilter onChange={onFilter} />
          <button onClick={ onNewItemClick } type="button" className="btn btn-primary w-125px">New Item</button>
        </div>
      </div>

      <div className="d-flex flex-row mt-10">
        <div className="me-6">{`${count} Budget Item${count === 1 ? '' : 's'}`}</div>
        <ManageItemsSort onChange={onSort} />
      </div>

      <div className="d-lg-none mt-4">
        {results.map(result => (
          <ManageItemRow item={result} for="card" />
        ))}
      </div>

      <div className="d-none d-lg-block">
        <table className="table align-middle table-row-dashed fs-6 gy-5 dataTable no-footer" id="kt_customers_table">
          <thead>
            <tr className="text-start text-gray-400 fw-bold fs-7 text-uppercase gs-0">
              <th className="w-10px pe-2 sorting_disabled" rowSpan={1} colSpan={1}>
                <div className="form-check form-check-sm form-check-custom form-check-solid me-3">
                  <input className="form-check-input" type="checkbox" />
                </div>
              </th>
              <th className="min-w-125px sorting" tabIndex={0} rowSpan={1} colSpan={1}>Name</th>
              <th className="min-w-125px sorting" tabIndex={0} rowSpan={1} colSpan={1}>Frequency</th>
              <th className="min-w-125px sorting" tabIndex={0} rowSpan={1} colSpan={1}>Span</th>
              <th className="min-w-125px sorting" tabIndex={0} rowSpan={1} colSpan={1}>Tags</th>
              <th className="min-w-125px sorting" tabIndex={0} rowSpan={1} colSpan={1}>Amount</th>
              <th className="min-w-125px sorting" tabIndex={0} rowSpan={1} colSpan={1}>YTD</th>
              <th className="text-end min-w-70px sorting_disabled" rowSpan={1} colSpan={1}>Actions</th>
            </tr>
          </thead>
          <tbody className="fw-semibold text-gray-600">
            {results.map(result => (
              <ManageItemRow item={result} for="table" />
            ))}
          </tbody>
        </table>
      </div>

      {/* { isCreatingItem && <UpdateBudgetItem mode="create" onCancel={() => { setIsCreatingItem(false) }}/> } */}
      { isCreatingItem && <NewBudgetItemModal onCancel={() => { setIsCreatingItem( false ) }} />}
    </div >
  );
}