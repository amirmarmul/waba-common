export interface EventOptions {
  [key: string]: unknown;
}

export interface Event {
  init(): Event;
  publish(options?: EventOptions): any;
}
