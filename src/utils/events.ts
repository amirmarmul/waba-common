import { Publisher } from '../contracts';

export function dispatcher(publisher: Publisher) {
  publisher.publish();
}
