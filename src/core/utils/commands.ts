import { Command } from '@/core/domain/Command';

export async function executor(command: Command): Promise<any> {
  return await command.execute();
}
