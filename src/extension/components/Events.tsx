import React, { FC } from "react";
import Event from "./Event";
import { NetworkEvent } from "../../tracing/network";

type PropTypes = {
  events: NetworkEvent[];
};

const Events: FC<PropTypes> = ({ events }) => {
  return (
    <>
      {events.map((event) => (
        <Event key={event.id} event={event} />
      ))}
    </>
  );
};

export default Events;
