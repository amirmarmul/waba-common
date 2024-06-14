import { Loader as LoaderContract } from "@/core/domain/loaders/Loader";
import { Container } from '@/core/infrastructure/Container';

export abstract class Loader implements LoaderContract {
  protected container: typeof Container;

  constructor() {
    this.container = Container;
  }

  load(): void {
    this.register();
  }

  abstract register(): void;
}
