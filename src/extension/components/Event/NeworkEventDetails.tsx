import React, { FC } from 'react';
import TracequestNetworkEvent from '../../../tracing/TracequestNetworkEvent';
import HttpBody from './HttpBody';
import HttpHeaders from './HttpHeaders';

type PropTypes = {
  event: TracequestNetworkEvent
}

const EventDetails: FC<PropTypes> = ({ event }) => {
  return <>
    <h4>Request:</h4>
    <HttpHeaders headers={event.meta.request.headers} />
    {event.meta.request.body && <HttpBody body={event.meta.request.body} />}
    <h4>Response:</h4>
    <HttpHeaders headers={event.meta.response.headers} />
    {event.meta.response.body && <HttpBody body={event.meta.response.body} />}
  </>
};

export default EventDetails;