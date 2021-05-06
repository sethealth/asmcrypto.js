import { sha256_asm, sha256result } from './sha256.asm';
import { Hash } from '../hash';
import { _heap_init } from '../../other/utils';

export const _sha256_block_size = 64;
export const _sha256_hash_size = 32;

const heap_pool: Uint8Array[] = [];
const asm_pool: sha256result[] = [];

export class Sha256 extends Hash<sha256result> {
  static NAME = 'sha256';
  public NAME = 'sha256';
  public BLOCK_SIZE = _sha256_block_size;
  public HASH_SIZE = _sha256_hash_size;

  constructor() {
    super();

    this.acquire_asm();
  }

  acquire_asm(): { heap: Uint8Array; asm: sha256result } {
    if (this.heap === undefined || this.asm === undefined) {
      this.heap = heap_pool.pop() || _heap_init();
      this.asm = asm_pool.pop() || sha256_asm({ Uint8Array: Uint8Array }, null, this.heap.buffer);
      this.reset();
    }
    return { heap: this.heap, asm: this.asm };
  }

  release_asm() {
    if (this.heap !== undefined && this.asm !== undefined) {
      heap_pool.push(this.heap);
      asm_pool.push(this.asm);
    }
    this.heap = undefined;
    this.asm = undefined;
  }

  static bytes(data: Uint8Array): Uint8Array | null {
    return new Sha256().process(data).finish().result;
  }
}
