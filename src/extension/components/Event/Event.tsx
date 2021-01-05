import React, { FC, useState } from "react";
import TracequestEvent from '../../../tracing/TracequestEvent';
import EventDetails from "./EventDetails";

type PropTypes = {
  event: TracequestEvent;
};

const Event: FC<PropTypes> = ({ event }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="event panel">
      <h4 className="event-header" onClick={() => setExpanded((old) => !old)}>
        <span>
          {event.id} {event.type}, {event.duration}ms
        </span>
        <span>{expanded ? "-" : "+"}</span>
      </h4>
      {expanded && <EventDetails event={event} />}
    </div>
  );
};

export default Event;
