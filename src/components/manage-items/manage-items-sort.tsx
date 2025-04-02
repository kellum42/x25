import React, { useState } from "react";

export const ManageItemsSort: React.FC<{ onChange: (sort: "asc" | "desc") => void }> = (props) => {
  const [sort, setSort] = useState<"asc" | "desc">("desc");

  const degrees: string = sort === "asc" ? "-90" : "90";

  const onSortClick = () => {
    setSort(sort === "asc" ? "desc" : "asc");
    props.onChange(sort);
  }

  return (
    <div onClick={onSortClick}>
      <span className="text-muted me-2">By Price</span>
      <span
        className="text-gray-400 fc-icon cursor-pointer fc-icon-chevron-right"
        style={{ transform: `rotateZ(${degrees}deg)`, display: "inline-block" }}
      ></span>
    </div>
  )
}