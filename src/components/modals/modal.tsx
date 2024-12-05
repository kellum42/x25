import React, { SetStateAction, useContext, useEffect, useState } from "react"

type ModalProps = {
  title: string;
  children?: React.ReactNode,
  isOpen: boolean,
  setIsOpen: React.Dispatch<SetStateAction<boolean>>,
  isLoading?: boolean,
  action?: { label: string, fn: () => void, cancel?: string }
}

export const Modal: React.FC<ModalProps> = (props) => {
  const { title, children, isOpen, setIsOpen, isLoading, action } = props;

  // style={{ display: "block", paddingLeft: "0px" }}
  return (
    <>
      <div className={"modal fade" + (isOpen ? " d-block show" : " ")} tabIndex={-1} aria-modal="true" role="dialog">
        <div className="modal-dialog modal-dialog-centered mw-650px">
          <div className="modal-content">
            <div className="modal-header" id="kt_modal_create_api_key_header">
              <h2>{title}</h2>
              <div className="btn btn-sm btn-icon btn-active-color-primary" data-bs-dismiss="modal">
                <span onClick={() => setIsOpen(false)} className="svg-icon svg-icon-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect opacity="0.5" x="6" y="17.3137" width="16" height="2" rx="1" transform="rotate(-45 6 17.3137)" fill="currentColor"></rect>
                    <rect x="7.41422" y="6" width="16" height="2" rx="1" transform="rotate(45 7.41422 6)" fill="currentColor"></rect>
                  </svg>
                </span>
              </div>
            </div>
            <div className="modal-body py-10 px-lg-17">
              <div className="scroll-y me-n7 pe-7">
                {children}
              </div>
            </div>
            { action && <div className="modal-footer flex-center">
							<button onClick={() => setIsOpen(false)} type="reset" className="btn btn-light me-3">{ action.cancel ?? "Discard" }</button>
							<button type="submit" onClick={() => action.fn()} className="btn btn-primary">
								<span className="indicator-label">{ action.label }</span>
								<span className="indicator-progress">Please wait...
								<span className="spinner-border spinner-border-sm align-middle ms-2"></span></span>
							</button>
						</div> }
          </div>
        </div>
      </div>
      <div onClick={() => setIsOpen(false)} className={"modal-backdrop fade" + (isOpen ? " show" : " d-none")}></div>
    </>
  );
}