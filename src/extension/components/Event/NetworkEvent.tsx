import React, { FC, useState } from "react";
import TracequestNetworkEvent from '../../../tracing/TracequestNetworkEvent';
import EventDetails from "./NeworkEventDetails";

type PropTypes = {
  event: TracequestNetworkEvent;
};

const Event: FC<PropTypes> = ({ event }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="event panel">
      <h4 className="event-header" onClick={() => setExpanded((old) => !old)}>
        <span>
          {event.meta.request.method} {event.meta.request.href} -{">"}{" "}
          {event.meta.response.status}, {event.duration}ms
        </span>
        <span>{expanded ? "-" : "+"}</span>
      </h4>
      {expanded && <EventDetails event={event} />}
    </div>
  );
};

export default Event;
