import { _heap_write } from '../other/utils';
import { IllegalStateError } from '../other/errors';
import { sha1result } from './sha1/sha1.asm';
import { sha256result } from './sha256/sha256.asm';
import { sha512result } from './sha512/sha512.asm';

export abstract class Hash<T extends sha1result | sha256result | sha512result> {
  public result!: Uint8Array | null;
  public pos: number = 0;
  public len: number = 0;
  public asm!: T | undefined;
  public heap!: Uint8Array | undefined;
  public BLOCK_SIZE!: number;
  public HASH_SIZE!: number;

  abstract acquire_asm(): { heap: Uint8Array; asm: T };

  abstract release_asm(): void;

  reset() {
    const { asm } = this.acquire_asm();

    this.result = null;
    this.pos = 0;
    this.len = 0;

    asm.reset();

    return this;
  }

  process(data: Uint8Array) {
    if (this.result !== null) throw new IllegalStateError('state must be reset before processing new data');

    const { asm, heap } = this.acquire_asm();
    let hpos = this.pos;
    let hlen = this.len;
    let dpos = 0;
    let dlen = data.length;
    let wlen = 0;

    while (dlen > 0) {
      wlen = _heap_write(heap, hpos + hlen, data, dpos, dlen);
      hlen += wlen;
      dpos += wlen;
      dlen -= wlen;

      wlen = asm.process(hpos, hlen);

      hpos += wlen;
      hlen -= wlen;

      if (!hlen) hpos = 0;
    }

    this.pos = hpos;
    this.len = hlen;

    return this;
  }

  finish() {
    if (this.result !== null) throw new IllegalStateError('state must be reset before processing new data');

    const { asm, heap } = this.acquire_asm();

    asm.finish(this.pos, this.len, 0);

    this.result = new Uint8Array(this.HASH_SIZE);
    this.result.set(heap.subarray(0, this.HASH_SIZE));

    this.pos = 0;
    this.len = 0;

    this.release_asm();

    return this;
  }
}
