import { Buffer } from 'buffer'
import process from 'process'

// Polyfill global objects for Solana libraries
;(window as any).Buffer = Buffer
;(window as any).process = process
;(window as any).global = window
;(globalThis as any).Buffer = Buffer
;(globalThis as any).process = process
