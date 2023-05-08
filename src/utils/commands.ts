import { Command } from '../contracts';

export function executor(command: Command) {
  command.execute();
}
