import React, { FC } from 'react';
import { NetworkEvent } from '../../tracing/network';
import HttpBody from './HttpBody';
import HttpHeaders from './HttpHeaders';

type PropTypes = {
  event: NetworkEvent
}

const EventDetails: FC<PropTypes> = ({ event }) => {
  return <>
    <h4>Request:</h4>
    <HttpHeaders headers={event.request.headers} />
    {event.request.body && <HttpBody body={event.request.body} />}
    <h4>Resposne:</h4>
    <HttpHeaders headers={event.response.headers} />
    {event.response.body && <HttpBody body={event.response.body} />}
  </>
};

export default EventDetails;