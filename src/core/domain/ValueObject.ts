export abstract class ValueObject<T> {
  public readonly props: T;

  constructor(props: T) {
    this.props = props;
  }
}
