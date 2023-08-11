export class JsonResource {
  [property: string]: any;

  protected hidden: string[] = [];
  protected fillable: string[] = [];
  protected attributes: any = {};

  constructor(attributes: object) {
    this.fill(attributes);

    return new Proxy(this, {
      get: (target, property: string) => {
        if (target.isAttribute(property)) {
          return target.getAttribute(property);
        }
        return target[property];
      },
      set: (target, property: string, value) => {
        target.setAttribute(property, value);
        return true;
      }
    });
  }

  protected fill(attributes: any) {
    for (const key in attributes) {
      this.setAttribute(key, attributes[key]);
    }
  }

  protected isAttribute(key: string): boolean {
    return this.attributes.hasOwnProperty(key);
  }
  
  protected getAttribute(key: string) {
    return this.attributes[key];
  }

  protected setAttribute(key: string, value: any): void {
    this.attributes[key] = value;
  }

  protected getHidden(): string[] {
    return this.hidden;
  }

  protected setHidden(keys: string[]): void {
    this.hidden = keys;
  }

  protected getFillable(): string[] {
    return this.fillable;
  }

  protected setFillable(keys: string[]): void {
    this.fillable = keys;
  }

  public toJSON() {
    return Object.keys(this.attributes)
      .filter(key => this.getFillable().includes(key))
      .filter(key => !this.getHidden().includes(key))
      .reduce((target: any, key) => {
        target[key] = this.attributes[key];
        return target;
      }, {});
  }
}

export default JsonResource;