import { Transform, TransformCallback } from "stream";

class StringTransformer extends Transform {
  constructor(...params: ConstructorParameters<typeof Transform>) {
    super(Object.assign({}, { writableObjectMode: true }, ...params));
  }

  public override _transform(
    chunk: any,
    _encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    const transformed = JSON.stringify(chunk);
    this.push(transformed);
    callback();
  }
}

export const stringTransformer = new StringTransformer();

class JsonArrayTransformer extends Transform {
  private itemCounter = 0;

  constructor(...params: ConstructorParameters<typeof Transform>) {
    super();
    this.push("[");
  }

  public override _transform(
    chunk: any,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    !!this.itemCounter && this.push(",");
    this.push(chunk);
    this.itemCounter++;
    callback();
  }

  public override _final(
    callback: (error?: Error | null | undefined) => void
  ): void {
    this.push("]");
    callback();
  }
}

export const jsonArrayTransformer = new JsonArrayTransformer();
