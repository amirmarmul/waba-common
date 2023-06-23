interface LooseObject {
  [key: string]: any;
}

export default class JsonResource {
  static hidden: string[] = [];
  static fillable: string[] = [];
  protected attributes: LooseObject = {};

  constructor(attributes: object) {
    this.attributes = attributes;
  }

  protected getHidden(): string[] {
    return JsonResource.hidden;
  }

  protected setHidden(keys: string[]): void {
    JsonResource.hidden = keys;
  }

  protected getFillable(): string[] {
    return JsonResource.fillable;
  }

  protected setFillable(keys: string[]): void {
    JsonResource.fillable = keys;
  }

  public toJSON() {
    return Object.keys(this.attributes)
      .filter(key => this.getFillable().includes(key))
      .filter(key => !this.getHidden().includes(key))
      .reduce((target: LooseObject, key) => {
        target[key] = this.attributes[key];
        return target;
      }, {});
  }
}