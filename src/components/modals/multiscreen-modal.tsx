import React, { useEffect, useState } from "react";
import { Schema } from "../../utils/types";
import { CheckBoxField, DateField, RadioField, SelectField, TextField } from "../fields";
import { Modal } from "./modal";

type FieldParams = {
  // name: keyof Schema<"item">,
  name: string,
  type: "text" | "radio" | "date" | "select" | "checkbox",
  format: "half" | "full",
  validations: string[],
  options?: {label: string, value: string}[],
  showOn?: (obj: Record<string,string>) => boolean,
  multi?: boolean,
  desc?: string,
  label?: string,
  defaultValue?: string
}

type MultiscreenModalProps = {
  fields: FieldParams[][],
  title: string,
  onSave: (params: Record<string, string>) => void,
  onCancel: () => void
}

export const MultiscreenModal: React.FC<MultiscreenModalProps> = ({ title, fields, onSave, onCancel }) => {

  const [params, setParams] = useState<Record<string, string>>({});
  const [screen, setScreen] = useState<number>(0);

  useEffect(() => {
    let _params: Record<string, string> = {};
    fields.map(v => {
      v.map(g => { _params[g.name] = g.defaultValue ? g.defaultValue : "" })
    });
    setParams(_params);
  }, [])

  // const onSaveHandler = () => {
  //   onSave(params);
  // }

  const updateParams = (key: string, value: string) => {
    setParams({ ...params, [key]: value })
  }

  return (
    <Modal
      title={title}
      isOpen={true}
      setIsOpen={onCancel}
      action={{
        label: screen < (fields.length - 1) ? "Next" : "Save",
        actionFn: () => {
          if ( screen < (fields.length - 1) ){
            setScreen( screen + 1 );
          } else {
            onSave(params);
          }
        },
        cancel: screen === 0 ? "Cancel" : "Back",
        cancelFn: () => {
          if ( screen === 0 ){
            onCancel()
          } else {
            setScreen( screen - 1 );
          }
        }
      }}
    >
      <div>
        {
          fields.map((fieldArr, i) => (
            fieldArr.map(field => (
              field.type === "text" ?
                screen === i && (field.showOn === undefined || field.showOn(params)) &&
                <TextField name={field.name} value={params[field.name]} updateValue={updateParams} validations={[]} desc={field.desc} label={field.label} /> :
               
                field.type === "radio" ? 
                  screen === i && (field.showOn === undefined || field.showOn(params)) &&
                  <RadioField name={field.name} value={params[field.name]} updateValue={updateParams} validations={[]} options={field.options ?? []} desc={field.desc} label={field.label} /> :
                  
                  field.type === "select" ? 
                    screen === i && (field.showOn === undefined || field.showOn(params)) && 
                    <SelectField name={field.name} value={params[field.name]} updateValue={updateParams} validations={[]} options={field.options ?? []} multi={field.multi} desc={field.desc} label={field.label} defaultValue={field.defaultValue} /> :  
                  
                    field.type === "date" ? 
                      screen === i && (field.showOn === undefined || field.showOn(params)) && 
                      <DateField name={field.name} value={params[field.name]} updateValue={updateParams} validations={[]} desc={field.desc} label={field.label} /> : 
                  
                      field.type === "checkbox" ? 
                        screen === i && (field.showOn === undefined || field.showOn(params)) && 
                        <CheckBoxField name={field.name} value={params[field.name]} updateValue={updateParams} validations={[]} desc={field.desc} label={field.label} /> : 

                        <></>
            ))
          ))
        }
      </div>
    </Modal>
  );
}