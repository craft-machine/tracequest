import React, { FC, useState } from "react";
import { NetworkEvent } from "../../tracing/network";
import EventDetails from "./EventDetails";

type PropTypes = {
  event: NetworkEvent;
};

const Event: FC<PropTypes> = ({ event }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="event panel">
      <h4 className="event-header" onClick={() => setExpanded((old) => !old)}>
        <span>
          {event.request.method} {event.request.href} -{">"}{" "}
          {event.response.status}, {event.duration}ms
        </span>
        <span>{expanded ? "-" : "+"}</span>
      </h4>
      {expanded && <EventDetails event={event} />}
    </div>
  );
};

export default Event;
