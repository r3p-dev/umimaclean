import { constants } from 'node:fs'
import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const OUTPUT_DIR = path.resolve('tmp/screenshots')

type ScreenshotPage = {
  screenshot(options: { path: string; fullPage: boolean }): Promise<unknown>
}

type ScreenshotElement = {
  screenshot(options: { path: string }): Promise<unknown>
}

// A normal test run writes only to the git-ignored OUTPUT_DIR. Committed evidence is written
// only when EVIDENCE_DIR names a folder (docs/SETUP.md §3), and an existing file is never
// overwritten: COPYFILE_EXCL makes the copy fail instead.
async function copyToEvidence(fileName: string) {
  const evidenceDir = process.env.EVIDENCE_DIR
  if (!evidenceDir) {
    return
  }

  await mkdir(path.resolve(evidenceDir), { recursive: true })
  await copyFile(
    path.join(OUTPUT_DIR, fileName),
    path.resolve(evidenceDir, fileName),
    constants.COPYFILE_EXCL
  )
}

export async function saveScreenshot(page: ScreenshotPage, fileName: string) {
  await page.screenshot({ path: path.join(OUTPUT_DIR, fileName), fullPage: true })
  await copyToEvidence(fileName)
}

export async function saveElementScreenshot(element: ScreenshotElement, fileName: string) {
  await element.screenshot({ path: path.join(OUTPUT_DIR, fileName) })
  await copyToEvidence(fileName)
}

export async function saveScreenshotLog(fileName: string, lines: string[]) {
  await mkdir(OUTPUT_DIR, { recursive: true })
  await writeFile(path.join(OUTPUT_DIR, fileName), lines.join('\n') + '\n', 'utf8')
  await copyToEvidence(fileName)
}
