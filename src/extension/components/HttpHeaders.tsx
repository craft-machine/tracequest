import React, { FC } from "react";

type PropTypes = {
  headers: Record<string, string | string[]>;
};

const HttpHeaders: FC<PropTypes> = ({ headers }) => {
  return (
    <>
      {Object.keys(headers).map((header) => {
        return (
          <div>
            <b>{header}: </b>
            <span>{headers[header]}</span>
          </div>
        );
      })}
    </>
  );
};

export default HttpHeaders;
