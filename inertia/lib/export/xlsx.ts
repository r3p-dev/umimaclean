export type CellType = 'text' | 'int' | 'rp' | 'date' | 'pct'

export type SheetColumn = { label: string; width?: number; type?: CellType }

export type SheetValue = string | number | Date | null | undefined

export type Sheet = { name: string; columns: SheetColumn[]; rows: SheetValue[][] }

const STYLE = { head: 1, rp: 2, date: 3, int: 4, pct: 5, text: 6 }

const encoder = new TextEncoder()

function printable(text: string) {
  return Array.from(text)
    .filter((char) => {
      const code = char.charCodeAt(0)
      if (code === 9 || code === 10 || code === 13) return true
      return code >= 32 && code !== 0xfffe && code !== 0xffff
    })
    .join('')
}

function escapeXml(value: unknown) {
  return printable(String(value))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function columnName(index: number) {
  let name = ''
  let number = index + 1
  while (number > 0) {
    const rest = (number - 1) % 26
    name = String.fromCharCode(65 + rest) + name
    number = Math.floor((number - 1) / 26)
  }
  return name
}

function dateSerial(date: Date) {
  return (
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(1899, 11, 30)) /
    86400000
  )
}

function sheetName(name: string, index: number) {
  return (
    String(name || `Sheet${index + 1}`)
      .replace(/[[\]:*?/\\]/g, ' ')
      .slice(0, 31)
      .trim() || `Sheet${index + 1}`
  )
}

function inlineCell(ref: string, style: number, value: unknown) {
  return `<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`
}

function sheetXml(sheet: Sheet) {
  const last = columnName(sheet.columns.length - 1) + (sheet.rows.length + 1)
  const widths = sheet.columns
    .map(
      (column, index) =>
        `<col min="${index + 1}" max="${index + 1}" width="${column.width ?? 14}" customWidth="1"/>`
    )
    .join('')
  const head = sheet.columns
    .map((column, index) => inlineCell(`${columnName(index)}1`, STYLE.head, column.label))
    .join('')
  const body = sheet.rows
    .map((row, rowIndex) => {
      const number = rowIndex + 2
      const cells = sheet.columns
        .map((column, index) => {
          const value = row[index]
          const ref = columnName(index) + number
          if (value === null || value === undefined || value === '') return ''
          if (column.type === 'date' && value instanceof Date) {
            return `<c r="${ref}" s="${STYLE.date}"><v>${dateSerial(value)}</v></c>`
          }
          if (
            (column.type === 'rp' || column.type === 'int' || column.type === 'pct') &&
            typeof value === 'number' &&
            Number.isFinite(value)
          ) {
            return `<c r="${ref}" s="${STYLE[column.type]}"><v>${column.type === 'pct' ? value / 100 : value}</v></c>`
          }
          return inlineCell(ref, STYLE.text, value)
        })
        .join('')
      return `<row r="${number}">${cells}</row>`
    })
    .join('')

  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    `<dimension ref="A1:${last}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/>` +
    `<cols>${widths}</cols><sheetData><row r="1">${head}</row>${body}</sheetData>` +
    `<autoFilter ref="A1:${last}"/><pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/></worksheet>`
  )
}

const STYLES_XML =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="2"><numFmt numFmtId="164" formatCode="&quot;Rp&quot;#,##0"/><numFmt numFmtId="165" formatCode="d mmm yyyy"/></numFmts><fonts count="2"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE8EDFB"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left/><right/><top/><bottom style="thin"><color rgb="FF8A93A6"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="7"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="3" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="9" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="49" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'

let crcTable: Uint32Array | null = null

function crc32(bytes: Uint8Array) {
  if (!crcTable) {
    crcTable = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      crcTable[n] = c >>> 0
    }
  }
  let c = 0xffffffff
  for (const byte of bytes) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function zip(parts: [string, string][]) {
  const now = new Date()
  const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)
  const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()
  const files = parts.map(([name, text]) => ({
    name: encoder.encode(name),
    data: encoder.encode(text),
  }))
  let size = 22
  for (const file of files) size += 30 + file.name.length + file.data.length + 46 + file.name.length
  const out = new Uint8Array(size)
  const view = new DataView(out.buffer)
  const directory: { name: Uint8Array; length: number; crc: number; offset: number }[] = []
  let offset = 0

  for (const file of files) {
    const crc = crc32(file.data)
    directory.push({ name: file.name, length: file.data.length, crc, offset })
    view.setUint32(offset, 0x04034b50, true)
    view.setUint16(offset + 4, 20, true)
    view.setUint16(offset + 6, 0x0800, true)
    view.setUint16(offset + 8, 0, true)
    view.setUint16(offset + 10, time, true)
    view.setUint16(offset + 12, date, true)
    view.setUint32(offset + 14, crc, true)
    view.setUint32(offset + 18, file.data.length, true)
    view.setUint32(offset + 22, file.data.length, true)
    view.setUint16(offset + 26, file.name.length, true)
    view.setUint16(offset + 28, 0, true)
    out.set(file.name, offset + 30)
    out.set(file.data, offset + 30 + file.name.length)
    offset += 30 + file.name.length + file.data.length
  }

  const directoryStart = offset
  for (const entry of directory) {
    view.setUint32(offset, 0x02014b50, true)
    view.setUint16(offset + 4, 20, true)
    view.setUint16(offset + 6, 20, true)
    view.setUint16(offset + 8, 0x0800, true)
    view.setUint16(offset + 10, 0, true)
    view.setUint16(offset + 12, time, true)
    view.setUint16(offset + 14, date, true)
    view.setUint32(offset + 16, entry.crc, true)
    view.setUint32(offset + 20, entry.length, true)
    view.setUint32(offset + 24, entry.length, true)
    view.setUint16(offset + 28, entry.name.length, true)
    view.setUint16(offset + 30, 0, true)
    view.setUint16(offset + 32, 0, true)
    view.setUint16(offset + 34, 0, true)
    view.setUint16(offset + 36, 0, true)
    view.setUint32(offset + 38, 0, true)
    view.setUint32(offset + 42, entry.offset, true)
    out.set(entry.name, offset + 46)
    offset += 46 + entry.name.length
  }

  view.setUint32(offset, 0x06054b50, true)
  view.setUint16(offset + 4, 0, true)
  view.setUint16(offset + 6, 0, true)
  view.setUint16(offset + 8, files.length, true)
  view.setUint16(offset + 10, files.length, true)
  view.setUint32(offset + 12, offset - directoryStart, true)
  view.setUint32(offset + 16, directoryStart, true)
  view.setUint16(offset + 20, 0, true)
  return out
}

export function workbookBytes(sheets: Sheet[], title: string) {
  const names = sheets.map((sheet, index) => sheetName(sheet.name, index))
  const stamp = new Date().toISOString().replace(/\.\d+Z$/, 'Z')
  const sheetTypes = sheets
    .map(
      (_, index) =>
        `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`
    )
    .join('')
  const sheetEntries = names
    .map(
      (name, index) =>
        `<sheet name="${escapeXml(name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`
    )
    .join('')
  const filters = sheets
    .map(
      (sheet, index) =>
        `<definedName name="_xlnm._FilterDatabase" localSheetId="${index}" hidden="1">'${escapeXml(names[index].replace(/'/g, "''"))}'!$A$1:$${columnName(sheet.columns.length - 1)}$${sheet.rows.length + 1}</definedName>`
    )
    .join('')
  const relations = sheets
    .map(
      (_, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`
    )
    .join('')

  const parts: [string, string][] = [
    [
      '[Content_Types].xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheetTypes}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`,
    ],
    [
      '_rels/.rels',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>',
    ],
    [
      'docProps/core.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${escapeXml(title)}</dc:title><dc:creator>Umima Owner</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${stamp}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${stamp}</dcterms:modified></cp:coreProperties>`,
    ],
    [
      'docProps/app.xml',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Umima Owner</Application></Properties>',
    ],
    [
      'xl/workbook.xml',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets>${sheetEntries}</sheets><definedNames>${filters}</definedNames></workbook>`,
    ],
    [
      'xl/_rels/workbook.xml.rels',
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relations}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    ],
    ['xl/styles.xml', STYLES_XML],
    ...sheets.map((sheet, index): [string, string] => [
      `xl/worksheets/sheet${index + 1}.xml`,
      sheetXml(sheet),
    ]),
  ]

  return zip(parts)
}
