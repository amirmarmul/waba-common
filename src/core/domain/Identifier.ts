export class Identifier<T> {
  constructor(private value: T) {}

  toString() {
    return String(this.value);
  }
}
