import { Head } from '@inertiajs/react'
import { IconCloudOff, IconRefresh } from '@tabler/icons-react'
import PublicLayout from '~/components/templates/public_layout'
import { Button } from '~/components/ui/button'

export default function ServerError() {
  return (
    <div
      role="alert"
      className="mx-auto flex max-w-md flex-col items-center gap-2.5 px-5 py-20 text-center"
    >
      <Head title="Terjadi kesalahan" />
      <IconCloudOff className="size-8 text-destructive" />
      <h1 className="text-2xl font-bold tracking-tight">Terjadi kesalahan</h1>
      <p className="text-sm text-pretty text-muted-foreground">
        Server kami sedang bermasalah. Coba lagi dalam beberapa saat.
      </p>
      <Button variant="outline" className="mt-2 h-11 px-4" onPress={() => window.location.reload()}>
        <IconRefresh className="size-4.5" />
        Coba Lagi
      </Button>
    </div>
  )
}

ServerError.layout = [PublicLayout]
