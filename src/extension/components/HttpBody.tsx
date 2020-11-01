import React, { FC } from "react";

type PropTypes = {
  body: string;
};

const HttpBody: FC<PropTypes> = ({ body }) => {
  let run = body;

  if (body.startsWith('{') || body.startsWith('[')) {
    run = JSON.parse(body);
  }
  
  return (
    <pre className="panel">
      {JSON.stringify(run, null, 2).replace(/\\n/g, "\n").replace(/\\"/g, '"')}
    </pre>
  );
};

export default HttpBody;
