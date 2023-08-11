import { Command } from '../contracts';

export async function executor(command: Command): Promise<any> {
  return await command.execute();
}
