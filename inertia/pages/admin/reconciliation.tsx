import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react'
import { urlFor } from '~/client'
import ToneBadge from '~/components/atoms/tone_badge'
import { FilterMenu } from '~/components/molecules/filter_menu'
import AdminPageHeader from '~/components/organisms/admin_page_header'
import { TABLE_HEAD_ROW } from '~/components/organisms/data_table/table_parts'
import AdminLayout from '~/components/templates/admin_layout'
import { Alert } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { formatRupiah } from '~/lib/shared/format'
import { useLiveReload } from '~/lib/shared/live'

type Flag = 'ok' | 'paid_not_advanced' | 'expired_pending' | 'amount_mismatch' | 'waiting'

type Row = {
  id: number
  providerOrderId: string
  transactionId: string | null
  code: string
  customer: string
  channel: string
  amount: number
  billTotal: number | null
  status: string
  orderStatus: string
  createdAt: string
  paidAt: string | null
  note: string | null
  flag: Flag
}

const FLAGS: Record<Flag, { label: string; tone: 'ok' | 'warn' | 'bayar' | 'off' | 'batal' }> = {
  ok: { label: 'Cocok', tone: 'ok' },
  waiting: { label: 'Menunggu bayar', tone: 'bayar' },
  expired_pending: { label: 'Kedaluwarsa, belum dikonfirmasi', tone: 'off' },
  paid_not_advanced: { label: 'Lunas, pesanan belum maju', tone: 'warn' },
  amount_mismatch: { label: 'Nominal tidak cocok', tone: 'batal' },
}

export default function AdminReconciliation({
  rows,
  isAvailable,
}: {
  rows: Row[]
  isAvailable: boolean
}) {
  const [flags, setFlags] = useState<Flag[]>([])
  const [busyId, setBusyId] = useState<number | null>(null)
  const shown = rows.filter((row) => !flags.length || flags.includes(row.flag))
  const problems = rows.filter((row) =>
    ['paid_not_advanced', 'amount_mismatch', 'expired_pending'].includes(row.flag)
  ).length
  useLiveReload('admin/orders', ['rows'])

  function refresh(row: Row) {
    router.post(
      urlFor('admin.reconciliation.refresh', { id: row.id }),
      {},
      {
        preserveScroll: true,
        onStart: () => setBusyId(row.id),
        onFinish: () => setBusyId(null),
      }
    )
  }

  return (
    <AdminLayout active="rekonsiliasi" title="Rekonsiliasi">
      <Head title="Rekonsiliasi pembayaran" />
      <AdminPageHeader
        title="Rekonsiliasi pembayaran"
        status={`${rows.length} transaksi QRIS terakhir · ${problems} perlu dicek`}
      />
      {!isAvailable && (
        <Alert variant="attention">
          <IconAlertTriangle className="size-5" />
          Midtrans belum dikonfigurasi (MIDTRANS_SERVER_KEY kosong). Kode QR tidak bisa dibuat dan
          status tidak bisa dicek ke penyedia.
        </Alert>
      )}
      <p className="text-sm leading-normal text-foreground-secondary">
        Mencocokkan setiap kode QRIS dari Midtrans dengan pesanannya. Pembayaran di luar QRIS
        (tunai, EDC, transfer) dicatat lewat “Koreksi pembayaran” di detail pesanan.
      </p>
      <div className="flex flex-wrap items-center gap-2.5">
        <FilterMenu
          word="Status"
          label="Filter status rekonsiliasi"
          values={flags}
          onChange={setFlags}
          options={(Object.keys(FLAGS) as Flag[]).map((flag) => ({
            value: flag,
            label: FLAGS[flag].label,
            count: rows.filter((row) => row.flag === flag).length,
          }))}
        />
      </div>
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <tr className={TABLE_HEAD_ROW}>
              <TableHead>ID Midtrans</TableHead>
              <TableHead>Pesanan</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Status bayar</TableHead>
              <TableHead>Status pesanan</TableHead>
              <TableHead>Hasil</TableHead>
              <TableHead>
                <span className="sr-only">Aksi</span>
              </TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {shown.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-foreground-secondary">
                  Belum ada transaksi QRIS{flags.length ? ' untuk filter ini' : ''}.
                </TableCell>
              </TableRow>
            )}
            {shown.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="py-3">
                  <span className="block font-mono text-meta">{row.providerOrderId}</span>
                  <span className="block text-caption text-muted-foreground">
                    {row.createdAt} · {row.channel}
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  <Link
                    href={urlFor('admin.order', { number: row.code })}
                    className="inline-flex min-h-11 items-center font-mono font-semibold"
                  >
                    {row.code}
                  </Link>
                  <span className="block text-caption text-muted-foreground">{row.customer}</span>
                </TableCell>
                <TableCell className="py-3 tabular-nums">
                  {formatRupiah(row.amount)}
                  {row.billTotal !== null && row.billTotal !== row.amount && (
                    <span className="block text-caption text-destructive-text">
                      tagihan {formatRupiah(row.billTotal)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="py-3">
                  {row.status}
                  {row.paidAt && (
                    <span className="block text-caption text-muted-foreground">{row.paidAt}</span>
                  )}
                </TableCell>
                <TableCell className="py-3">{row.orderStatus}</TableCell>
                <TableCell className="py-3">
                  <ToneBadge tone={FLAGS[row.flag].tone}>{FLAGS[row.flag].label}</ToneBadge>
                  {row.note && (
                    <span className="mt-1 block text-caption text-muted-foreground">
                      {row.note}
                    </span>
                  )}
                </TableCell>
                <TableCell className="py-3">
                  <Button
                    variant="outline"
                    size="compact"
                    isDisabled={!isAvailable}
                    isPending={busyId === row.id}
                    onPress={() => refresh(row)}
                  >
                    <IconRefresh className="size-4.5" />
                    Cek ke Midtrans
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  )
}
