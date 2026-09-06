import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

/* mapshaper splits its command string on whitespace, so absolute paths break
   as soon as any parent directory contains a space. Every call therefore runs
   with the pipeline root as cwd and passes relative paths only. */
export const pipelineRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

export function useRelativePaths() {
  process.chdir(pipelineRoot)
}

export const RAW = 'raw'
export const OUT = 'out'
