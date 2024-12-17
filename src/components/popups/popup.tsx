import React from "react";
import { BudgetItem } from "../../utils/schemas";

type PopupProps = {
  item: BudgetItem,
  onDeleteItem: (item: BudgetItem) => void,
  onCancel: () => void
}

export const Popup: React.FC<PopupProps> = ({ item, onDeleteItem, onCancel }) => {
  return (
    <div className="swal2-container swal2-center swal2-backdrop-show" style={{overflowY: "auto"}}>
      <div aria-labelledby="swal2-title" aria-describedby="swal2-html-container" className="swal2-popup swal2-modal swal2-icon-warning swal2-show" tabIndex={-1} role="dialog" aria-live="assertive" aria-modal="true" style={{display: "grid"}}>
        <button type="button" className="swal2-close" aria-label="Close this dialog" style={{display: "none"}}>×</button>
        <ul className="swal2-progress-steps" style={{display: "none"}}></ul>
        <div className="swal2-icon swal2-warning swal2-icon-show" style={{display: "flex"}}>
          <div className="swal2-icon-content">!</div>
        </div>
        <img className="swal2-image" style={{display: "none"}} />
          <h2 className="swal2-title" id="swal2-title" style={{display: "none"}}></h2>
          <div className="swal2-html-container" id="swal2-html-container" style={{display: "block"}}>{`Are you sure you want to delete "${item.name}"?`}</div>
          <input className="swal2-input" style={{display: "none"}} />
          <input type="file" className="swal2-file" style={{display: "none"}} />
          <div className="swal2-range" style={{display: "none"}}>
            <input type="range" />
              <output></output>
          </div>
          <select className="swal2-select" style={{display: "none"}}></select>
          <div className="swal2-radio" style={{display: "none"}}></div>
          <label htmlFor="swal2-checkbox" className="swal2-checkbox" style={{display: "none"}}>
            <input type="checkbox" />
              <span className="swal2-label"></span>
          </label>
          <textarea className="swal2-textarea" style={{display: "none"}}></textarea>
          <div className="swal2-validation-message" id="swal2-validation-message" style={{display: "none"}}></div>
          <div className="swal2-actions" style={{display: "flex"}}>
            <div className="swal2-loader"></div>
            <button 
              type="button" 
              className="swal2-confirm btn fw-bold btn-danger" 
              aria-label="" 
              style={{display: "inline-block"}}
              onClick={() => onDeleteItem(item)}
            >
              Yes, delete!
            </button>
            <button type="button" className="swal2-deny" aria-label="" style={{display: "none"}}>No</button>
            <button 
              type="button" 
              className="swal2-cancel btn fw-bold btn-active-light-primary"
              aria-label="" 
              style={{display: "inline-block"}}
              onClick={() => onCancel()}
            >
              No, cancel
            </button>
          </div>
          <div className="swal2-footer" style={{display: "none"}}></div>
          <div className="swal2-timer-progress-bar-container">
            <div className="swal2-timer-progress-bar" style={{display: "none"}}></div>
          </div>
      </div>
    </div>
  );
} 