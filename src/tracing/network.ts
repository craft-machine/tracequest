import { EventEmitter } from "events";
import { inherits } from "util";
import { parse } from "url";
import { IncomingMessage } from "http";
import zlib from 'zlib';

// @ts-ignore part of node.js internals
import internalHttpClient from "_http_client";

const events = new EventEmitter();
const mod = {
  started: false,
  start,
  events,
};

export enum EventState {
  LINKING = "linking",
  LINKED = "linked",
  ENDED = "ended",
  ERROR = "error",
}

export enum NetworkEvents {
  LINKING = "linking",
  END = "end",
}

export type NetworkEvent = {
  id: string;
  start: number;
  end: number;
  duration: number;
  state: EventState;
  error: Error | null;

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

export default mod;

export function urlToOptions(url: URL) {
  const options = {
    protocol: url.protocol,
    hostname: url.hostname.startsWith("[")
      ? url.hostname.slice(1, -1)
      : url.hostname,
    hash: url.hash,
    search: url.search,
    pathname: url.pathname,
    path: `${url.pathname}${url.search}`,
    href: url.href,
  } as any;
  if (url.port !== "") {
    options.port = Number(url.port);
  }
  if (url.username || url.password) {
    options.auth = `${url.username}:${url.password}`;
  }
  return options;
}

export function start() {
  if (mod.started) {
    return events;
  }

  const Client = internalHttpClient.ClientRequest;
  const { write, end } = Client.prototype;
  const searchParamsSymbol = Symbol.for("query");

  internalHttpClient.ClientRequest = function ClientRequest(
    input: any,
    options: any,
    cb?: any
  ) {
    if (typeof input === "string") {
      const urlStr = input;
      try {
        input = urlToOptions(new URL(urlStr));
      } catch (err) {
        input = parse(urlStr);
        if (!input.hostname) throw err;
      }
    } else if (
      input &&
      input[searchParamsSymbol] &&
      input[searchParamsSymbol][searchParamsSymbol]
    ) {
      input = urlToOptions(input);
    } else {
      cb = options;
      options = input;
      input = null;
    }

    if (typeof options === "function") {
      cb = options;
      options = input || {};
    } else {
      options = Object.assign(input || {}, options);
    }

    const event = startEvent();
    
    event.request.href = getHref(options);
    event.request.headers = options.headers;
    event.request.method = options.method;

    let error: Error | undefined;
    try {
      Client.call(this, options, (res: IncomingMessage) => {
        event.response.headers = res.headers;
        event.response.status = res.statusCode;
        event.state = EventState.LINKING;

        events.emit("linked", event);

        res.on("data", (data) => {
          event.response.body = concatData(event.response.body, data);

          events.emit("receiving", event);
        });

        if (typeof cb === "function") cb(res);
      });
    } catch (e) {
      error = e;
    }

    events.emit("linking", event);

    const handleOutgoingData = (data: string | Buffer) => {
      event.request.body = concatData(event.request.body, data);

      events.emit("sending", event);
    };

    this.once("close", () => {
      endEvent(event);
      events.emit(NetworkEvents.END, event);
    });

    this.once("error", (err) => {
      setError(event, err);
      events.emit(NetworkEvents.END, event);
    });

    this.write = (...args: any[]) => (
      args[0] && handleOutgoingData(args[0]), write.apply(this, args)
    );

    this.end = (...args: any[]) => (
      args[0] && handleOutgoingData(args[0]), end.apply(this, args)
    );

    if (error) {
      setError(event, error);
      events.emit("linked", event);

      throw error;
    }
  };

  inherits(internalHttpClient.ClientRequest, Client);

  mod.started = true;

  return events;
}

export function startEvent(): NetworkEvent {
  return {
    id: Math.random().toString(16).replace(".", ""),
    start: Date.now(),
    end: null,
    duration: null,
    state: EventState.LINKING,
    error: null,

    request: {
      href: null,
      method: null,
      headers: {},
      body: null,
    },

    response: {
      status: null,
      headers: {},
      body: null,
    },
  };
}

export function setError(event: NetworkEvent, error: Error) {
  endEvent(event);
  event.state = EventState.ERROR;
  event.error = error;
}

export function endEvent(event: NetworkEvent) {
  event.state = EventState.ENDED;
  event.end = Date.now();
  event.duration = event.end - event.start;
}

export function concatData(prefix: string = '', data: string | Buffer) {
  return (prefix || '') + dataToString(data);
}

export function dataToString(data: string | Buffer) {
  if (data instanceof Buffer) {
    try {
      return zlib.unzipSync(data).toString();
    } catch(e) {
      return data.toString('utf-8');
    }
  }

  return data;
}

export function getHref(options) {
  return options.href || `${options.protocol}${options.hostname}${options.path}`;
}