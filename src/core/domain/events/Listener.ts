export interface Listener {
  init(): Listener;
  listen(): any;
}
