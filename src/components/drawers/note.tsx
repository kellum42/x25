import React, { ChangeEvent, useState } from "react";

import { BudgetNote, x25Error } from "../../utils/schemas";
import { getUniqueID } from "../../utils/util";
import dayjs from "dayjs";
import { error } from "console";

type NoteDrawerProps = {
  open: boolean,
  notes?: BudgetNote[],
  save: (note: BudgetNote) => void,
  deleteNote: (note: BudgetNote) => void,
  error?: x25Error
}

export const NoteDrawer: React.FC<NoteDrawerProps> = (props) => {
  const { open, notes, save, error, deleteNote } = props;

  const [newNote, setNewNote] = useState<string>("");

  const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNewNote( event.target.value );
  }

  const maybeSave = () => {
    const _newNote = newNote.trim();
    if ( _newNote ){
      save({
        id: getUniqueID(),
        date: dayjs(),
        body: _newNote
      });
      
      if ( error ){
        console.log(error.message);
      } else {
        setNewNote("");
      }
    }
  }


  return (
    <div className={`drawer drawer-end ${open ? 'drawer-on' : ''} w-75`}>
      <div className="card shadow-none border-0 rounded-0 w-100">
        <div className="card-header" id="kt_activities_header">
          <h3 className="card-title fw-bold text-dark">Notes</h3>
          <div className="card-toolbar">
            <button type="button" className="btn btn-sm btn-icon btn-active-light-primary me-n5" id="kt_activities_close">
              <span className="svg-icon svg-icon-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect opacity="0.5" x="6" y="17.3137" width="16" height="2" rx="1" transform="rotate(-45 6 17.3137)" fill="currentColor"></rect>
                  <rect x="7.41422" y="6" width="16" height="2" rx="1" transform="rotate(45 7.41422 6)" fill="currentColor"></rect>
                </svg>
              </span>
            </button>
          </div>
        </div>

        <div className="card-body">
          <div className="scroll-y me-n5 pe-5">
            {(notes ?? []).map((note) => (
              <div className="d-flex justify-content-start mb-10">
                <div className="d-flex flex-column align-items-start">
                  <div className="d-flex align-items-center mb-2">
                    <div className="ms-3">
                      <span className="text-muted fs-7 mb-1">{note.date.format("MM/DD/YYYY h:mm a")}</span>
                    </div>
                  </div>
                  <div className="d-flex flex-row align-items-center">
                    <div className="p-5 rounded bg-light-info text-dark fw-semibold mw-lg-400px text-start" data-kt-element="message-text">{note.body}</div>
                    <span onClick={() => { deleteNote(note) }} className="ms-2 bg-hover-body text-gray-400">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 9C5 8.44772 5.44772 8 6 8H18C18.5523 8 19 8.44772 19 9V18C19 19.6569 17.6569 21 16 21H8C6.34315 21 5 19.6569 5 18V9Z" fill="currentColor" />
                        <path opacity="0.5" d="M5 5C5 4.44772 5.44772 4 6 4H18C18.5523 4 19 4.44772 19 5V5C19 5.55228 18.5523 6 18 6H6C5.44772 6 5 5.55228 5 5V5Z" fill="currentColor" />
                        <path opacity="0.5" d="M9 4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V4H9V4Z" fill="currentColor" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-footer pt-4" id="kt_drawer_chat_messenger_footer">
          <textarea onChange={handleInputChange} value={newNote} className="form-control form-control-flush mb-3" rows={1} data-kt-element="input" placeholder="Type a note"></textarea>
          <div className="d-flex flex-stack">
            <div className="d-flex align-items-center me-2">
              {/* <button className="btn btn-sm btn-icon btn-active-light-primary me-1" type="button" data-bs-toggle="tooltip" aria-label="Coming soon" data-kt-initialized="1">
                    <i className="bi bi-paperclip fs-3"></i>
                  </button>
                  <button className="btn btn-sm btn-icon btn-active-light-primary me-1" type="button" data-bs-toggle="tooltip" aria-label="Coming soon" data-kt-initialized="1">
                    <i className="bi bi-upload fs-3"></i>
                  </button> */}
            </div>
            <button onClick={maybeSave} className="btn btn-primary" type="button" disabled={newNote.trim().length === 0}>Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}