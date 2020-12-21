import { createLogger } from 'browser-bunyan'
export type Logger = Omit<ReturnType<typeof createLogger>, 'error'> & {
  error(err: Error, msg: string): void
}
