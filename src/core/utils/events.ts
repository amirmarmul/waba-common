import { Event, EventOptions } from '@/core/domain/events/Event';

export async function dispatcher(publisher: Event, options?: EventOptions): Promise<any> {
  return await publisher.init().publish(options);
}
