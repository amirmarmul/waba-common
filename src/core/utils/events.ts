import { Event } from '@/core/domain/events/Event';

export async function dispatcher(publisher: Event) {
  await publisher.publish();
}
