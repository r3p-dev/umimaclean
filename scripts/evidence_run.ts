#!/usr/bin/env node
// Runs one verification command for a milestone's evidence (docs/SETUP.md §3, docs/ARCHITECTURE.md D84).
//
//   node scripts/evidence_run.ts <milestone> <name> -- <command> [args…]
//
// The command's output goes only to tmp/evidence/<milestone>/logs/<name>.log, after a header with the
// time, the command, the commit and any uncommitted changes. Stdout gets one line,
// `PASS|FAIL exit=<n> log=<path>`, plus the last 40 lines of the log on failure. The exit code is the
// command's. An existing log is never overwritten: evidence is the record of one run.
import { execFileSync, spawn } from 'node:child_process'
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, writeSync } from 'node:fs'
import path from 'node:path'

const FOLDER_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/

function git(args: string[]) {
  return execFileSync('git', args, { encoding: 'utf8' }).trimEnd()
}

// A command that could not start reports a negative errno; use the shell's 127 instead.
function exitCodeOf(code: number | null, signal: NodeJS.Signals | null) {
  if (code !== null && code >= 0) {
    return code
  }
  return signal ? 128 : 127
}

function shellQuote(arg: string) {
  return /^[A-Za-z0-9_./=:@%+,-]+$/.test(arg) ? arg : `'${arg.replaceAll("'", `'\\''`)}'`
}

const separator = process.argv.indexOf('--')
const [milestone, name] = process.argv.slice(2, separator)
const command = process.argv.slice(separator + 1)

if (separator !== 4 || !FOLDER_NAME.test(milestone) || !FOLDER_NAME.test(name) || !command.length) {
  console.error('Usage: node scripts/evidence_run.ts <milestone> <name> -- <command> [args…]')
  console.error('<milestone> and <name> are plain folder/file names such as M4a and lint.')
  process.exit(2)
}

const logPath = path.join('tmp/evidence', milestone, 'logs', `${name}.log`)
mkdirSync(path.dirname(logPath), { recursive: true })
if (existsSync(logPath)) {
  console.error(`${logPath} already exists; evidence is never overwritten. Use another name.`)
  process.exit(2)
}
const log = openSync(logPath, 'wx')

const status = git(['status', '--short'])
const header = [
  `# time: ${new Date().toISOString()}`,
  `# command: ${command.map(shellQuote).join(' ')}`,
  `# commit: ${git(['rev-parse', '--short', 'HEAD'])}`,
  `# tree: ${status ? 'dirty' : 'clean'}`,
  ...(status ? status.split('\n').map((line) => `#   ${line}`) : []),
  '',
]
writeSync(log, header.join('\n') + '\n')

const child = spawn(command[0], command.slice(1), { stdio: ['ignore', log, log] })
child.on('error', (error) => {
  writeSync(log, `\nfailed to start: ${error.message}\n`)
})
child.on('close', (code, signal) => {
  const exitCode = exitCodeOf(code, signal)
  writeSync(log, `\nexit ${exitCode}${signal ? ` (signal ${signal})` : ''}\n`)
  closeSync(log)

  console.log(`${exitCode === 0 ? 'PASS' : 'FAIL'} exit=${exitCode} log=${logPath}`)
  if (exitCode !== 0) {
    console.log(readFileSync(logPath, 'utf8').trimEnd().split('\n').slice(-40).join('\n'))
  }
  process.exitCode = exitCode
})
