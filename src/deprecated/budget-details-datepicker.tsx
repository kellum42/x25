import React, { FC, useState, useEffect, SetStateAction, forwardRef, useContext } from "react"
import dayjs, { Dayjs } from "dayjs"
import DatePicker from "react-datepicker";

import "../styles/fc.css"
import "../styles/budget-details-datepicker.css"
import "react-datepicker/dist/react-datepicker.css"

import { getFriday } from "../utils/occurrence"
import { BudgetContext } from "../contexts/budgetContext";

// type BudgetDetailsDatePickerProps = {
//   date: Dayjs,
//   setDate: React.Dispatch<SetStateAction<Dayjs>>
// }

// TODO: - Take what I need from fc.css, and remove it.

export const BudgetDetailsDatePicker: FC = () => {
  // const { setDate, date } = props;
  const format = "MMM D";

  const context = useContext( BudgetContext );

  if ( !context ){
    throw new Error( "Calling Budget Context from outside of provider." );
  }

  const { date, setDate } = context;
  
  const changeWeek = ( to: "prev" | "next" ) => {
    setDate( to === "next" ? date.add( 7, "day" ) : date.subtract( 7, "day" ) );
  }

  const goToToday = () => {
    setDate( getFriday( dayjs() ) );
  }

  const isThisWeek = () => {
    return getFriday( date ).isSame( getFriday( dayjs() ), 'day' )
  };

  const formattedSpan = () => {
    return date.format( format ) + " - " + date.add( 7, "day" ).format( format ) + " " + date.add( 7, "day" ).year();
  }

  const onDatePicked = (_date: Date | null ) => {
    if ( _date ){
      setDate( getFriday( dayjs( _date ) ) );
    }
  }

  const DatePickerButton = forwardRef<HTMLButtonElement, React.HTMLProps<HTMLButtonElement>>( ({ onClick }, ref ) => {
    return (
      <button onClick={onClick} ref={ref} type="button" title="Datepicker" aria-pressed="false" className="fc-button fc-button-primary">
        <i className="fa fa-calendar" aria-hidden="true" style={{ fontSize: "18px" }}></i>
      </button>
    )
  });

  return (
    <div className="budgetddp card card-xl-stretch mb-5 mb-xl-8">
      <div className="card-p">
        <div className="fc" style={{}}>
          <div className="fc-button-grou budgetddp-date-display">
            <button onClick={() => changeWeek( "prev" )} type="button" title="Previous day" aria-pressed="false" className="fc-prev-button fc-button fc-button-primary">
              <span className="fc-icon fc-icon-chevron-left"></span>
            </button>
            <div className="fc-toolbar-chunk mb-0">
              <h3 className="px-4">{ formattedSpan() }</h3>
            </div>
            <button onClick={() => changeWeek( "next" )} type="button" title="Next day" aria-pressed="false" className="fc-next-button fc-button fc-button-primary">
              <span className="fc-icon fc-icon-chevron-right"></span>
            </button>
          </div>
          <div className="budgetddp-buttons">
            <DatePicker
              selected={ date.toDate() }
              onChange={ onDatePicked }
              customInput={ <DatePickerButton />}
            />
            {
              !isThisWeek() &&
              <button onClick={goToToday} type="button" title="Today" aria-pressed="false" className="fc-today-button fc-button fc-button-primary text-gray-500 fw-bold">go to today</button>
            }
          </div>
        </div>
      </div>
    </div>
  )
}