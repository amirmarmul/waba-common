import { Loader as LoaderContract } from "@/core/domain/loaders/Loader";
import { ContainerInstance } from '@/core/infrastructure/Container';

export abstract class Loader implements LoaderContract {
  protected container: ContainerInstance;

  protected setContainer(container: ContainerInstance): Loader {
    this.container = container;

    return this;
  }

  load(): void {
    this.register();
  }

  abstract register(): void;
}
