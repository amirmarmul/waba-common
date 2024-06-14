import { Manager as LoaderManagerContract } from '@/core/domain/loaders/Manager';

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
      instance.load();
    });
  }

  protected resolve(klass: any) {
    if (klass instanceof Function) {
      klass = new klass();
    }
    return klass;
  }
}
