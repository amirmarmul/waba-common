import { Publisher } from '../contracts';

export async function dispatcher(publisher: Publisher): Promise<any> {
  return await publisher.publish();
}
