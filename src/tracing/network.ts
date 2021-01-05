import { EventEmitter } from "events";
import { inherits } from "util";
import { parse } from "url";
import { IncomingMessage } from "http";
import zlib from "zlib";

// @ts-ignore part of node.js internals
import internalHttpClient from "_http_client";
import TracequestNetworkEvent from "./TracequestNetworkEvent";
import utils from "./utils";

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

    event.meta.request.href = getHref(options);
    event.meta.request.headers = options.headers;
    event.meta.request.method = options.method;

    let error: Error | undefined;
    try {
      Client.call(this, options, (res: IncomingMessage) => {
        event.meta.response.headers = res.headers;
        event.meta.response.status = res.statusCode;
        event.meta.state = EventState.LINKING;

        events.emit("linked", event);

        res.on("data", (data) => {
          event.meta.response.body = concatData(event.meta.response.body, data);

          events.emit("receiving", event);
        });

        if (typeof cb === "function") cb(res);
      });
    } catch (e) {
      error = e;
    }

    events.emit("linking", event);

    const handleOutgoingData = (data: string | Buffer) => {
      event.meta.request.body = concatData(event.meta.request.body, data);

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

export function startEvent(): TracequestNetworkEvent {
  return {
    id: utils.generateId(16),
    type: "network",

    start: Date.now(),
    end: null,
    duration: null,

    meta: {
      state: EventState.LINKING,

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
    },
  };
}

export function setError(event: TracequestNetworkEvent, error: Error) {
  endEvent(event);
  event.meta.state = EventState.ERROR;
  event.meta.error = error;
}

export function endEvent(event: TracequestNetworkEvent) {
  event.meta.state = EventState.ENDED;
  event.end = Date.now();
  event.duration = event.end - event.start;
}

export function concatData(prefix: string = "", data: string | Buffer) {
  return (prefix || "") + dataToString(data);
}

export function dataToString(data: string | Buffer) {
  if (data instanceof Buffer) {
    try {
      return zlib.unzipSync(data).toString();
    } catch (e) {
      return data.toString("utf-8");
    }
  }

  return data;
}

export function getHref(options) {
  return (
    options.href || `${options.protocol}${options.hostname}${options.path}`
  );
}
