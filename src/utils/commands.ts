import { Command } from '../contracts';

export async function executor(command: Command) {
  await command.execute();
}
