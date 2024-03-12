export interface Event {
  init(): Event;
  publish(): any;
}
