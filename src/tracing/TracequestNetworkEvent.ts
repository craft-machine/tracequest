import { EventState } from './network';
import TracequestEvent from "./TracequestEvent";

export default interface TracequestNetworkEvent extends TracequestEvent {
  type: 'network';

  meta: {
    state: EventState;
    error?: Error;

    request: {
      href: string;
      method: string;
      headers: Record<string, string | string[]>;
      body: string;
    };

    response: {
      status: number;
      headers: Record<string, string | string[]>;
      body: string;
    };
  };
}
