import { Manager as LoaderManagerContract } from '@/core/domain/loaders/Manager';
import { Container } from '@/core/infrastructure/Container';

export class LoaderManager implements LoaderManagerContract {
  protected loaders: any[] = [
    //
  ];

  constructor(loaders: any[]) {
    this.loaders.push(...loaders);
  }

  load(): void {
    this.loaders.forEach((loader: any) => {
      const instance = this.resolve(loader);
      instance.setContainer(Container).load();
    });
  }

  protected resolve(klass: any) {
    if (klass instanceof Function) {
      klass = new klass();
    }
    return klass;
  }
}
