export type TracequestEventId = string;

export default interface TracequestEvent {
  id: TracequestEventId;
  type: string;

  start: number;
  end: number;
  duration: number;

  meta: Object;
};