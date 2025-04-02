import React, { useEffect, useState } from "react"
import Select, { SingleValue, MultiValue } from 'react-select'

import { Menu } from "./floating-menu";
import { BudgetItemFilters } from "./budget-item-query";
import { BudgetItemFrequency } from "../utils/schemas";

// TODO:
//  - Do filtering when the "Apply" button is hit.
//  - Will have to store the state locally. 

export const BudgetItemFilterMenu: React.FC<{
  filters: BudgetItemFilters,
  setFilters: React.Dispatch<React.SetStateAction<BudgetItemFilters>>,
  default: BudgetItemFilters
}> = (props) => {
  const [isActive, setIsActive] = useState(false);

  const handleStateChange = (change: SingleValue<{ label: string, value: string | null }>) => {
    if (change) {
      const state = change.value as "active" | "inactive" | null;
      props.setFilters({ ...props.filters, state });
    }
  }

  const handleFrequencyChange = (change: MultiValue<{ label: string, value: BudgetItemFrequency }>) => {
    const frequency = change.map((_frequency) => _frequency.value);
    props.setFilters({ ...props.filters, frequency });
  }

  const getFrequencyOptions = () => {
    return Object.keys(BudgetItemFrequency).map(key => (
      { value: BudgetItemFrequency[key as keyof typeof BudgetItemFrequency], label: key }
    ));
  }

  const sortOptions = [
    { label: "All", value: null },
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" }
  ];

  useEffect(() => {
    setIsActive(
      props.filters.frequency !== props.default.frequency ||
      props.filters.state !== props.default.state
    );

  }, [props.filters]);


  const filterButton: React.ReactNode = (
    <button type="button" className={"btn btn-light-primary me-3" + (isActive ? " active" : "")} data-kt-menu-placement="bottom-end">
      <span className="svg-icon svg-icon-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.0759 3H4.72777C3.95892 3 3.47768 3.83148 3.86067 4.49814L8.56967 12.6949C9.17923 13.7559 9.5 14.9582 9.5 16.1819V19.5072C9.5 20.2189 10.2223 20.7028 10.8805 20.432L13.8805 19.1977C14.2553 19.0435 14.5 18.6783 14.5 18.273V13.8372C14.5 12.8089 14.8171 11.8056 15.408 10.964L19.8943 4.57465C20.3596 3.912 19.8856 3 19.0759 3Z" fill="currentColor"></path>
        </svg>
      </span>
      Filter
    </button>
  );
  return (
    <Menu label="" rootMenuButton={filterButton}>
      <div>
        <div className="px-7 py-5">
          <div className="fs-4 text-dark fw-bold">Filter Options</div>
        </div>
        <div className="separator border-gray-200"></div>
        <div className="px-7 py-5">
          <div className="mb-10" data-select2-id="select2-data-191-hbxa">
            <label className="form-label fs-5 fw-semibold mb-3">Frequency:</label>
            <Select
              defaultValue={getFrequencyOptions().filter(op => props.filters.frequency.includes(op.value))}
              isMulti
              name="item-frequency"
              options={getFrequencyOptions()}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={handleFrequencyChange}
            />

          </div>
          <div className="mb-10">
            <label className="form-label fs-5 fw-semibold mb-3">Item State:</label>
            <div className="d-flex flex-column flex-wrap fw-semibold" data-kt-customer-table-filter="payment_type">
              <Select
                defaultValue={sortOptions.find((o) => o.value === props.default.state)}
                name="item-state"
                options={sortOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={handleStateChange}
              />
            </div>
          </div>
          <div className="d-flex justify-content-end">
            <button type="reset" className="btn btn-light btn-active-light-primary me-2" data-kt-menu-dismiss="true" data-kt-customer-table-filter="reset">Reset</button>
            <button type="submit" className="btn btn-primary" data-kt-menu-dismiss="true" data-kt-customer-table-filter="filter">Apply</button>
          </div>
        </div>
      </div>
    </Menu>
  )
}