import { EventEmitter } from "events";
import Hook from "./Hook";
import HooksConfig from "./HooksConfig";
import TracequestEvent, { TracequestEventId } from "./TracequestEvent";
import HooksEvents from "./HooksEvents";
import utils from "./utils";

export default class Hooks extends EventEmitter {
  static maybeConstructor(target: any) {
    return Object.getOwnPropertyNames(target).every((property) =>
      ["length", "name", "prototype"].includes(property)
    );
  }

  static resolveTarget(target: any) {
    if (Hooks.maybeConstructor(target)) {
      return target.prototype || target.constructor.prototype;
    }

    return target;
  }

  static isInstumentable(target: any, method: string): boolean {
    return target && typeof target[method] === "function";
  }

  listening: boolean = false;
  events: Record<TracequestEventId, TracequestEvent> = {};

  reset() {
    this.listening = false;
    this.events = {};
  }

  instrument(config: HooksConfig | HooksConfig[]) {
    if (Array.isArray(config)) {
      return config.every(this.instrument.bind(this));
    }

    try {
      config.hooks.forEach((hook) => this.addHook(config.target, hook));
      return true;
    } catch (e) {
      throw new Error(`Tracequest: Instrumentation failed: ${e}`);
    }
  }

  addHook(target, hook: Hook): boolean {
    const instrumentationTarget = Hooks.resolveTarget(target);

    if (Hooks.isInstumentable(instrumentationTarget, hook.method)) {
      const hooks = this;
      const originalMethod = target[hook.method];

      target[hook.method] = function () {
        let result;

        const eventId = hooks.start(
          hook.event,
          hook.getMeta ? hook.getMeta(arguments, this) : null
        );

        try {
          result = originalMethod.apply(this, arguments);
        } catch (error) {
          hooks.stop(eventId, {
            error: utils.serializeError(error),
          });

          throw error;
        }

        if (result instanceof Promise) {
          return result.then(
            hooks.handleResolved(eventId),
            hooks.handleRejected(eventId)
          );
        } else {
          hooks.stop(eventId);
          return result;
        }
      };

      return true;
    }

    return false;
  }

  start(type: string, meta?: any): TracequestEventId {
    if (this.listening) {
      let event = {
        type,
        id: utils.generateId(16),

        start: Date.now(),
        end: null,
        duration: null,

        meta,
      };

      this.events[event.id] = event;
      this.emit(HooksEvents.START, event);
      return event.id;
    }
  }

  stop(id: TracequestEventId, meta?: any) {
    if (this.listening && this.events[id]) {
      let event = this.events[id];

      event.end = Date.now();
      event.duration = event.end - event.start;

      if (meta && event.meta) {
        Object.assign(event.meta, meta);
      } else {
        event.meta = meta;
      }

      this.emit(HooksEvents.STOP, event);
      delete this.events[id];
    }
  }

  stopAll() {
    Object.keys(this.events).forEach((eventId) => {
      if (!this.events[eventId].end) {
        this.stop(eventId);
      }
    });
  }

  handleResolved(id: TracequestEventId) {
    return (res) => {
      this.stop(id);
      return res;
    };
  }

  handleRejected(id: TracequestEventId) {
    return (error) => {
      this.stop(id, {
        error,
      });

      return Promise.reject(error);
    };
  }
}
