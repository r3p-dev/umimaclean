#!/usr/bin/env node
// `npm run check`: lint, typecheck and tests with one line per passing step (docs/SETUP.md §3).
// Each step's full output goes to tmp/check/<step>.log; a failing step prints its name and the end
// of its log, and the run stops there with the step's exit code. VERBOSE=1 prints the full output.
import { spawnSync } from 'node:child_process'
import { closeSync, mkdirSync, openSync, readFileSync } from 'node:fs'
import path from 'node:path'

const steps = [
  { name: 'lint', command: ['npm', 'run', 'lint'] },
  { name: 'typecheck', command: ['npm', 'run', 'typecheck'] },
  // dot is a built-in Japa reporter: one character per test, details only for failures.
  { name: 'test', command: ['node', 'ace', 'test', '--reporters=dot'] },
]
const verbose = process.env.VERBOSE === '1'

mkdirSync('tmp/check', { recursive: true })

for (const step of steps) {
  const started = Date.now()
  const logPath = path.join('tmp/check', `${step.name}.log`)
  const log = verbose ? 'inherit' : openSync(logPath, 'w')
  const result = spawnSync(step.command[0], step.command.slice(1), { stdio: ['ignore', log, log] })
  if (typeof log === 'number') {
    closeSync(log)
  }

  const seconds = Math.round((Date.now() - started) / 1000)
  if (result.status === 0) {
    console.log(`ok   ${step.name} (${seconds}s)`)
    continue
  }

  console.log(`FAIL ${step.name} (${seconds}s, exit ${result.status ?? result.signal})`)
  if (!verbose) {
    console.log(readFileSync(logPath, 'utf8').trimEnd().split('\n').slice(-40).join('\n'))
    console.log(`full log: ${logPath}`)
  }
  process.exit(result.status || 1)
}
