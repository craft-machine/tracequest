import { TracequestEventId } from './TracequestEvent';

const idSource = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split(
  ""
);

export default {
  generateId,
  serializeError,
};

function generateId(length: number): TracequestEventId {
  return new Array(length)
    .fill(0)
    .map(() => anyOf(idSource))
    .join("");
}

function anyOf<T>(collection: Array<T>): T {
  return collection[Math.floor(rand(collection.length))];
}

function rand(bottom: number, top?: number): number {
  if (!top) {
    [bottom, top] = [0, bottom];
  }

  return bottom + Math.random() * (top - bottom);
}

function serializeError(error: any) {
  if (error.stack) {
    return error.stack;
  }

  return error;
}