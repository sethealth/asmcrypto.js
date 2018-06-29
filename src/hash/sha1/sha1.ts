import { sha1_asm, sha1result } from './sha1.asm';
import { Hash } from '../hash';
import { _heap_init } from '../../other/utils';

export const _sha1_block_size = 64;
export const _sha1_hash_size = 20;

const heap_pool: Uint8Array[] = [];
const asm_pool: sha1result[] = [];

export class Sha1 extends Hash<sha1result> {
  static NAME = 'sha1';
  public NAME = 'sha1';
  public BLOCK_SIZE = _sha1_block_size;
  public HASH_SIZE = _sha1_hash_size;

  protected static heap_pool = [];
  protected static asm_pool = [];
  protected static asm_function = sha1_asm;

  constructor() {
    super();

    this.acquire_asm();
  }

  acquire_asm(): { heap: Uint8Array, asm: sha1result } {
    if (this.heap === undefined || this.asm === undefined) {
      this.heap = heap_pool.pop() || _heap_init();
      this.asm = asm_pool.pop() || sha1_asm({ Uint8Array: Uint8Array }, null, this.heap.buffer);
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
