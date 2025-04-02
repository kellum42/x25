import React from "react";

export const MenuButton: React.FC = () => {
  return (
    <button type="button" className="btn btn-sm btn-icon btn-color-light-dark btn-active-light-primary" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">
      <span className="svg-icon svg-icon-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
          <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <rect x="5" y="5" width="5" height="5" rx="1" fill="currentColor"></rect>
            <rect x="14" y="5" width="5" height="5" rx="1" fill="currentColor" opacity="0.3"></rect>
            <rect x="5" y="14" width="5" height="5" rx="1" fill="currentColor" opacity="0.3"></rect>
            <rect x="14" y="14" width="5" height="5" rx="1" fill="currentColor" opacity="0.3"></rect>
          </g>
        </svg>
      </span>
    </button>
  )
};