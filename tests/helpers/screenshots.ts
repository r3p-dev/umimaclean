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

// A normal test run writes only to the git-ignored OUTPUT_DIR. Evidence for a milestone is copied
// to tmp/evidence/<milestone>/screenshots/ only when EVIDENCE_MILESTONE names one (docs/SETUP.md §3,
// docs/ARCHITECTURE.md D84). The milestone must be a plain folder name, so nothing can be written
// outside tmp/evidence/, and an existing file is never overwritten: COPYFILE_EXCL makes the copy fail.
async function copyToEvidence(fileName: string) {
  const milestone = process.env.EVIDENCE_MILESTONE
  if (!milestone) {
    return
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(milestone)) {
    throw new Error(`EVIDENCE_MILESTONE must be a folder name like M4a, got "${milestone}"`)
  }
  if (path.basename(fileName) !== fileName) {
    throw new Error(`Screenshot file names must not contain a folder, got "${fileName}"`)
  }

  const evidenceDir = path.resolve('tmp/evidence', milestone, 'screenshots')
  await mkdir(evidenceDir, { recursive: true })
  await copyFile(
    path.join(OUTPUT_DIR, fileName),
    path.join(evidenceDir, fileName),
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
