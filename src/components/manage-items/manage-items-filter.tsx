import React, { ChangeEvent, useEffect, useState } from "react";
import { x25log } from "../../utils/log";
import { Menu } from "../floating-menu";

export type ManageItemsFilterType = {
  frequency: { once: boolean, weekly: boolean, biweekly: boolean, monthly: boolean },
  state: "all" | "active" | "inactive"
}


export const ManageItemsFilter: React.FC<{ onChange: (filters: ManageItemsFilterType) => void }> = (props) => {
  const def: ManageItemsFilterType = {
    "frequency": { once: true, weekly: true, biweekly: true, monthly: true },
    "state": "all"
  }
  const [filters, setFilters] = useState<ManageItemsFilterType>(def);

  useEffect(() => {
  }, []);

  const onCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const value = event.target.value;

    setFilters(prevState => ({
      ...prevState,
      [name]: name === "frequency" ?
        { ...prevState["frequency"], [value]: event.target.checked } :
        value
    }))
  }

  const onApply = () => {
    x25log.d("[onApply][items.tsx]: Appling filters. %s", JSON.stringify(filters));
    props.onChange(filters);
  }

  const onReset = () => {
    x25log.d("[onApply][items.tsx]: Resetting filters.");
    setFilters(def);
  }

  return (
    <Menu
      label=""
      rootMenuButton={
        <button type="button" className="btn btn-light-primary me-3 w-125px">
          <span className="svg-icon svg-icon-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.0759 3H4.72777C3.95892 3 3.47768 3.83148 3.86067 4.49814L8.56967 12.6949C9.17923 13.7559 9.5 14.9582 9.5 16.1819V19.5072C9.5 20.2189 10.2223 20.7028 10.8805 20.432L13.8805 19.1977C14.2553 19.0435 14.5 18.6783 14.5 18.273V13.8372C14.5 12.8089 14.8171 11.8056 15.408 10.964L19.8943 4.57465C20.3596 3.912 19.8856 3 19.0759 3Z" fill="currentColor"></path>
            </svg>
          </span>
          Filter
        </button>
      }
    >
      <div className="p-6">
        <h5>Filter Options</h5>
        <div className="separator border-gray-200"></div>
        <div className="my-10">
          <label className="form-label fs-5 fw-semibold mb-3">Frequency:</label>
          <div className="d-flex flex-column flex-wrap fw-semibold">
            <label className="form-check form-check-sm form-check-custom form-check-solid mb-3 me-5">
              <input onChange={onCheckboxChange} className="form-check-input" type="checkbox" name="frequency" value="once" checked={filters.frequency.once} />
              <span className="form-check-label text-gray-600">Once</span>
            </label>
            <label className="form-check form-check-sm form-check-custom form-check-solid mb-3 me-5">
              <input onChange={onCheckboxChange} className="form-check-input" type="checkbox" name="frequency" value="weekly" checked={filters.frequency.weekly} />
              <span className="form-check-label text-gray-600">Weekly</span>
            </label>
            <label className="form-check form-check-sm form-check-custom form-check-solid mb-3">
              <input onChange={onCheckboxChange} className="form-check-input" type="checkbox" name="frequency" value="biweekly" checked={filters.frequency.biweekly} />
              <span className="form-check-label text-gray-600">Bi-weekly</span>
            </label>
            <label className="form-check form-check-sm form-check-custom form-check-solid">
              <input onChange={onCheckboxChange} className="form-check-input" type="checkbox" name="frequency" value="monthly" checked={filters.frequency.monthly} />
              <span className="form-check-label text-gray-600">Monthly</span>
            </label>
          </div>
        </div>
        <div className="my-10">
          <label className="form-label fs-5 fw-semibold mb-3">State:</label>
          <div className="d-flex flex-column flex-wrap fw-semibold">
            <label className="form-check form-check-sm form-check-custom form-check-solid mb-3 me-5">
              <input onChange={onCheckboxChange} className="form-check-input" type="radio" name="state" value="all" checked={filters.state === "all"} />
              <span className="form-check-label text-gray-600">All</span>
            </label>
            <label className="form-check form-check-sm form-check-custom form-check-solid mb-3 me-5">
              <input onChange={onCheckboxChange} className="form-check-input" type="radio" name="state" value="active" checked={filters.state === "active"} />
              <span className="form-check-label text-gray-600">Active</span>
            </label>
            <label className="form-check form-check-sm form-check-custom form-check-solid mb-3 me-5">
              <input onChange={onCheckboxChange} className="form-check-input" type="radio" name="state" value="inactive" checked={filters.state === "inactive"} />
              <span className="form-check-label text-gray-600">Inactive</span>
            </label>
          </div>
        </div>
        <div className="d-flex justify-content-end flex-row">
          <button onClick={() => onReset()} type="reset" className="btn btn-light btn-active-light-primary me-2">Reset</button>
          <button onClick={() => onApply()} type="submit" className="btn btn-primary">Apply</button>
        </div>
      </div>
    </Menu>
  );
}