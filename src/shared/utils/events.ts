import { Publisher } from '../contracts';

export async function dispatcher(publisher: Publisher) {
  await publisher.publish();
}
