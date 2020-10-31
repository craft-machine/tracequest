import React, { FC } from "react";
import { NetworkEvent } from "../../tracing/network";

type PropTypes = {
  event: NetworkEvent;
};

const Event: FC<PropTypes> = ({ event }) => {
  return (
    <div className="event">
      <h4>
      {event.request.method} {event.request.href} -> {event.duration}
    </h4>
    {/* <pre>{JSON.stringify(event.request.headers, null, 2)}</pre> */}
    </div>
  );
};

export default Event;
