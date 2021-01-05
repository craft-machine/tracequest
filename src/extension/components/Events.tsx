import React, { FC } from "react";
import NetworkEvent from "./Event/NetworkEvent";
import Event from "./Event/Event";
import TracequestEvent from "../../tracing/TracequestEvent";

type PropTypes = {
  events: TracequestEvent[];
};

const Components = {
  network: NetworkEvent,
  default: Event,
};

const Events: FC<PropTypes> = ({ events }) => {
  return (
    <>
      {events.map((event) => {
        const Component = Components[event.type] ?? Components.default;
        return <Component key={event.id} event={event} />;
      })}
    </>
  );
};

export default Events;
