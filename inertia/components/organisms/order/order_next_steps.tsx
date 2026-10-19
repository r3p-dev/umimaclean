const NEXT_STEPS = [
  'Kurir menghubungi Anda via WhatsApp sebelum datang.',
  'Barang diperiksa di workshop. Tagihan dikirim via WhatsApp.',
  'Bayar dengan scan QRIS di halaman pesanan.',
]

export default function OrderNextSteps() {
  return (
    <section className="flex flex-col gap-3.5 pt-7">
      <h2 className="text-[17px] leading-[1.3] font-semibold">Selanjutnya</h2>
      <ol className="flex flex-col gap-x-5 gap-y-3.5 sm:grid sm:grid-cols-3">
        {NEXT_STEPS.map((text, index) => (
          <li key={text} className="grid grid-cols-[28px_1fr] items-start gap-3">
            <span className="size-7 rounded-full bg-accent text-center text-meta leading-7 font-semibold text-info-foreground">
              {index + 1}
            </span>
            <span className="text-[15px] leading-normal">{text}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
