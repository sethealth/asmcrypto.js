import { sha512_asm, sha512result } from './sha512.asm';
import { Hash } from '../hash';
import { _heap_init } from '../../other/utils';

export const _sha512_block_size = 128;
export const _sha512_hash_size = 64;

const heap_pool: Uint8Array[] = [];
const asm_pool: sha512result[] = [];

export class Sha512 extends Hash<sha512result> {
  static NAME = 'sha512';
  public NAME = 'sha512';
  public BLOCK_SIZE = _sha512_block_size;
  public HASH_SIZE = _sha512_hash_size;

  constructor() {
    super();

    this.acquire_asm();
  }

  acquire_asm(): { heap: Uint8Array, asm: sha512result } {
    if (this.heap === undefined || this.asm === undefined) {
      this.heap = heap_pool.pop() || _heap_init();
      this.asm = asm_pool.pop() || sha512_asm({ Uint8Array: Uint8Array }, null, this.heap.buffer);
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
}
