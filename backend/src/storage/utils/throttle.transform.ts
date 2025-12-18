import { Transform, TransformCallback } from 'stream';

export class ThrottleTransform extends Transform {
  private readonly bytesPerSecond: number;
  private tokens: number;
  private last: number;

  constructor(kbps: number) {
    super();
    this.bytesPerSecond = Math.max(1, kbps) * 1024;
    this.tokens = this.bytesPerSecond;
    this.last = Date.now();
    setInterval(() => this.refill(), 250);
  }

  private refill() {
    const now = Date.now();
    const elapsed = now - this.last;
    this.tokens = Math.min(
      this.bytesPerSecond,
      this.tokens + (this.bytesPerSecond * elapsed) / 1000,
    );
    this.last = now;
  }

  _transform(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: TransformCallback,
  ) {
    const processChunk = () => {
      if (chunk.length <= this.tokens) {
        this.tokens -= chunk.length;
        this.push(chunk);
        callback();
      } else {
        const slice: Buffer = chunk.subarray(0, this.tokens);
        const rest: Buffer = chunk.subarray(this.tokens);
        this.tokens = 0;
        this.push(slice);
        setTimeout(() => {
          this._transform(rest, _encoding, callback);
        }, 50);
      }
    };
    processChunk();
  }
}
