import React, { useEffect, useState } from "react";
import Select, { ActionMeta, MultiValue, SingleValue } from "react-select";
import { uppercaseWords } from "../utils/util";
import { FormDatePicker } from "./form-datepicker";
import dayjs, { Dayjs } from "dayjs";

type TextFieldType = {
  name: string,
  value: string,
  updateValue: (key: string, value: string) => void,
  validations: string[],
  desc?: string,
  defaultValue?: string,
  label?: string
}

export const TextField: React.FC<TextFieldType> = (props) => {
  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    props.updateValue(props.name, e.target.value);
  }

  // useEffect(() => {
  //   setValue( props.value );
  // }, [])

  return (
    <div className="mb-5 fv-row fv-plugins-icon-container">
      <label className="required fs-5 fw-semibold mb-2">{props.label ?? uppercaseWords(props.name)}</label>
      {props.desc && <div className="fs-7 fw-semibold text-muted">{props.desc}</div>}
      <input type="text" onChange={onChange} defaultValue={props.value} value={value} className="form-control form-control-solid" placeholder={uppercaseWords(props.name)} name={props.name} />
      <div className="fv-plugins-message-container invalid-feedback"></div>
    </div>
  )
}

type RadioFieldType = TextFieldType & {
  options: { label: string, value: string }[]
}

export const RadioField: React.FC<RadioFieldType> = (props) => {

  const [value, setValue] = useState<string>(
    props.options.length > 0 ? props.options[0].value : ""
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    props.updateValue(props.name, e.target.value);
  }

  return (
    <div className="mb-5 cfv-plugins-icon-container">
      <label className="required fs-5 fw-semibold mb-2">{props.label ?? uppercaseWords(props.name)}</label>
      {props.desc && <div className="fs-7 fw-semibold text-muted">{props.desc}</div>}
      <div>
        <div className="btn-group w-250px">
          {props.options.map(option =>
            <label className={"btn btn-outline btn-active-success btn-color-muted" + (value === option.value ? " active" : "")}>
              <input className="btn-check" name={props.name} type="radio" value={option.value} checked={value === option.value} onChange={onChange} />
              {option.label}
            </label>
          )}
        </div>
      </div>
      <div className="fv-plugins-message-container invalid-feedback"></div>
    </div>
  )
}

type SelectFieldType = RadioFieldType & {
  multi?: boolean
}

export const SelectField: React.FC<SelectFieldType> = (props) => {
  const onChange = (newValue: MultiValue<{
    label: string;
    value: string;
  }> | SingleValue<{
    label: string;
    value: string;
  }>, actionMeta: ActionMeta<{
    label: string;
    value: string;
  }>) => {
    if (newValue) {
      props.updateValue(props.name, (Array.isArray(newValue) ? newValue : [newValue]).map(v => v.value).join(","));
    }
  }

  const getDefaultIndex = (): number => {
    let map: Record<string,number> = {}
    props.options.map( (o, i) => { map[o.value] = i})

    if ( props.defaultValue && props.defaultValue in map ){
      return map[props.defaultValue];
    } else {
      return 0;
    }
  }

  return (
    <div className="col-6">
      <label className="required fs-6 fw-semibold">{props.label ?? uppercaseWords(props.name)}</label>
      {props.desc && <div className="fs-7 fw-semibold text-muted">{props.desc}</div>}
      <Select
        defaultValue={props.options.length > 0 ? props.options[getDefaultIndex()] : undefined}
        isMulti={props.multi}
        options={props.options}
        onChange={onChange}
      />
    </div>
  )
}

export const DateField: React.FC<TextFieldType> = (props) => {
  const [error, setError] = useState<string>("");

  const onChange = (name: string, value: string | undefined) => {
    props.updateValue(name, value ?? "");
  }

  return (
    <div className="mb-5 fv-row fv-plugins-icon-container">
      <label className="required fs-6 fw-semibold mb-2">{props.label ?? uppercaseWords(props.name)}</label>
      <div>
        <FormDatePicker
          name={props.name}
          value={props.value}
          onUpdate={onChange}
        />
      </div>
    </div>
  )
}

export const CheckBoxField: React.FC<TextFieldType> = (props) => {
  const [value, setValue] = useState<boolean>(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.checked);
    props.updateValue(props.name, e.target.checked ? "true" : "false");

    // e.target.checked ? dayjs().format(dateFormat) : "-1")
  }

  return (
    <div className="col-12 mb-8">
      <div className="d-flex flex-stack">
        <div className="me-5">
          {props.label && <label className="fs-6 fw-semibold">{props.label}</label>}
          {props.desc && <div className="fs-7 fw-semibold text-muted">{props.desc}</div>}
        </div>
        <label className="form-check form-switch form-check-custom form-check-solid">
          <input
            onChange={onChange}
            className="form-check-input"
            type="checkbox"
            checked={value}
          />
          <span className="form-check-label fw-semibold text-muted">{value ? "Yes" : "No"}</span>
        </label>
      </div>
    </div>
  )

}