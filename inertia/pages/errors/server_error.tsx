import { Head } from '@inertiajs/react'
import { IconCloudOff, IconRefresh } from '@tabler/icons-react'
import CustomerLayout from '~/components/templates/customer_layout'
import { Button } from '~/components/ui/button'

export default function ServerError() {
  return (
    <>
      <Head title="Terjadi kesalahan" />
      <div
        role="alert"
        className="mx-auto flex max-w-110 flex-col items-center gap-2.5 px-5 py-20 text-center"
      >
        <IconCloudOff className="size-8 text-destructive-text" />
        <h1 className="text-h1">Terjadi kesalahan</h1>
        <p className="text-sm text-pretty text-muted-foreground">
          Server kami sedang bermasalah. Coba lagi dalam beberapa saat.
        </p>
        <Button
          variant="outline"
          size="desktop"
          className="mt-2"
          onPress={() => window.location.reload()}
        >
          <IconRefresh className="size-4.5" />
          Coba Lagi
        </Button>
      </div>
    </>
  )
}

ServerError.layout = [CustomerLayout]
