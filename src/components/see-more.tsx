import React, { useState } from "react";

type SeeMoreProps = {
  items: React.ReactNode[]
}

export const SeeMore: React.FC<SeeMoreProps> = ({items}) => {
  const [page, setPage] = useState<number>(1);
  const pageSize: number = 8;
  const hasMore: boolean = (page * pageSize) < items.length;
  const visibleItems: number = (page * pageSize) >= items.length ? items.length : page * pageSize;

  const onSeeMoreClick = () => {
    if ( hasMore ){
      setPage(page + 1);
    }
  }

  const onSeeLessClick = () => {
    setPage(1);
  }

  return (
    <div>
      <div>{items.slice(0, visibleItems).map( item => item )}</div>
      <div className="p-2 my-2 text-end">
      { hasMore &&
        <span onClick={onSeeMoreClick} className="p-2 text-primary fw-bold cursor-pointer">See More</span>
      }
      { !hasMore && page > 1 &&
        <span onClick={onSeeLessClick} className="p-2 text-primary fw-bold cursor-pointer">See Less</span>        
      }
      </div>
    </div>
  );
}