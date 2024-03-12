import { Event } from '@/core/domain/events/Event';

export async function dispatcher(publisher: Event): Promise<any> {
  return await publisher.init().publish();
}
