import { Transform, TransformCallback } from "stream";
import log from "_services/log/log.service";

export class StringTransformer extends Transform {
  constructor(...params: ConstructorParameters<typeof Transform>) {
    super({ ...params, objectMode: true });
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

// export const stringTransformer = new StringTransformer();

export class JsonArrayTransformer extends Transform {
  private itemCounter = 0;

  constructor(...params: ConstructorParameters<typeof Transform>) {
    super(...params);
    this.push("[");
  }

  public override _transform(
    chunk: any,
    _encoding: BufferEncoding,
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

  public getItemCount(): number {
    return this.itemCounter;
  }
}

// export const jsonArrayTransformer = new JsonArrayTransformer();

export class NeutralTransformer extends Transform {
  constructor(...params: ConstructorParameters<typeof Transform>) {
    super({ ...params, objectMode: true });
  }

  public override _transform(
    chunk: any,
    encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    log.debug("Received stream", { chunk, encoding });
    this.push(chunk);
    callback();
  }

  public override _final(
    callback: (error?: Error | null | undefined) => void
  ): void {
    log.debug("Final called");
    callback();
  }
}

// export const neutralTransformer = new NeutralTransformer();
