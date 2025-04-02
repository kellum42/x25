import React, { useEffect, useState } from "react";
import { Schema } from "../../utils/types";
import dayjs from "dayjs";
import { asCurrency } from "../../utils/util";

type ManageItemRowProps = {
  item: Schema<"item">,
  for: "table" | "card"
}

export const ManageItemRow: React.FC<ManageItemRowProps> = (props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const item = props.item;

  const getSpan = () => {
    if (item.frequency === undefined) { return "--"; }
    if (item.frequency === "Once") {
      return item.date === undefined ? "--" : dayjs(item.date).format("M/D/YY");
    } else {
      const start = item.starts ? "From " + dayjs(item.starts).format("M/D/YY") : "--";
      const end = item.ends === undefined || item.ends === "-1" ? "" : "to " + dayjs(item.ends).format("M/D/YY");
      return start + " " + end;
    }
  }

  return (
    <>
      {
        props.for === "card" ?
          <>
            <div className="py-6">
              <div className="d-flex flex-row flex-stack rotate-90">
                <h5>{item.name}</h5>
                <div className="d-flex flex-row align-items-center">
                  <p className="mb-0">{asCurrency(item.amount)}</p>
                  <span
                    className="text-gray-400 fc-icon cursor-pointer fc-icon-chevron-right ms-5"
                    style={{ transform: `rotateZ(${isOpen ? "-90" : "90"}deg)`, display: "inline-block" }}
                    onClick={() => { setIsOpen(!isOpen) }}
                  ></span>
                </div>

              </div>
              {isOpen &&
                <div className="py-2">
                  <div className="d-flex flex-row flex-stack">
                    <p className="text-muted">When:</p>
                    <p>{item.frequency}</p>
                  </div>
                  <div className="d-flex flex-row flex-stack">
                    <p className="text-muted">Span:</p>
                    <p>{getSpan()}</p>
                  </div>
                  <div className="d-flex flex-row flex-stack">
                    <p className="text-muted">Tags:</p>
                    {/* <p>{item.frequency}</p> */}
                  </div>
                  <div className="d-flex flex-row flex-stack">
                    <p className="text-muted">Amount:</p>
                    <p>{item.amount === undefined ? "--" : "$" + item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="d-flex flex-row flex-stack">
                    <p className="text-muted">YTD:</p>
                    <p>{item.frequency}</p>
                  </div>
                </div>
              }
            </div>
            <div className="separator separator-dashed"></div>
          </> :

          <tr className="odd">
            <td>
              <div className="form-check form-check-sm form-check-custom form-check-solid">
                <input className="form-check-input" type="checkbox" value="1" />
              </div>
            </td>
            <td>
              <a href="../dist/apps/customers/view.html" className="text-gray-800 text-hover-primary mb-1">{item.name}</a>
            </td>
            <td>
              <a href="#" className="text-gray-600 text-hover-primary mb-1">{item.frequency}</a>
            </td>
            <td></td>
            <td></td>
            <td>{item.amount}</td>
            <td>{item.amount}</td>
            <td className="text-end">
              <a href="#" className="btn btn-sm btn-light btn-active-light-primary" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">Actions
                <span className="svg-icon svg-icon-5 m-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.4343 12.7344L7.25 8.55005C6.83579 8.13583 6.16421 8.13584 5.75 8.55005C5.33579 8.96426 5.33579 9.63583 5.75 10.05L11.2929 15.5929C11.6834 15.9835 12.3166 15.9835 12.7071 15.5929L18.25 10.05C18.6642 9.63584 18.6642 8.96426 18.25 8.55005C17.8358 8.13584 17.1642 8.13584 16.75 8.55005L12.5657 12.7344C12.2533 13.0468 11.7467 13.0468 11.4343 12.7344Z" fill="currentColor"></path>
                  </svg>
                </span>
              </a>
              {/* <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold fs-7 w-125px py-4" data-kt-menu="true">
                <div className="menu-item px-3">
                  <a href="../dist/apps/customers/view.html" className="menu-link px-3">View</a>
                </div>
                <div className="menu-item px-3">
                  <a href="#" className="menu-link px-3" data-kt-customer-table-filter="delete_row">Delete</a>
                </div>
              </div> */}
            </td>
          </tr>
      }
    </>
  )
}