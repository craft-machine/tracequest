import React, { FC } from "react";
import { NetworkEvent } from "../../tracing/network";

type PropTypes = {
  event: NetworkEvent;
};

const Event: FC<PropTypes> = ({ event }) => {
  return (
    <div className="event">
      <h4>
        {event.request.method} {event.request.href} -{">"} {event.duration}
      </h4>
    </div>
  );
};

export default Event;
