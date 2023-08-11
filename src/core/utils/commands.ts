import { Command } from '@/core/domain/Command';

export async function executor(command: Command) {
  await command.execute();
}
