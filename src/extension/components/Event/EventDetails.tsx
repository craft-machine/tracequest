import React, { FC } from "react";
import TracequestEvent from "../../../tracing/TracequestEvent";

type PropTypes = {
  event: TracequestEvent;
};

const EventDetails: FC<PropTypes> = ({ event }) => {
  return (
    <>
      <h4>Details:</h4>
      <div>
        <b>Start: </b>
        <span>{new Date(event.start).toString()}</span>
      </div>
      <div>
        <b>End: </b>
        <span>{new Date(event.end).toString()}</span>
      </div>
      <div>
        <b>Duration: </b>
        <span>{event.duration}ms</span>
      </div>

      {event.meta && (
        <>
          <h4>Meta:</h4>
          <pre className="panel">
            {JSON.stringify(event.meta, null, 2)
              .replace(/\\n/g, "\n")
              .replace(/\\"/g, '"')}
          </pre>
        </>
      )}
    </>
  );
};

export default EventDetails;
