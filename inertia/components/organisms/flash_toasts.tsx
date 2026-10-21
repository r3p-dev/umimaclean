import { useEffect } from 'react'
import { toast } from 'sonner'
import { router, usePage } from '@inertiajs/react'
import { Toaster } from '~/components/ui/sonner'

export default function FlashToasts() {
  const { flash, props } = usePage()
  const formError = (props.errors as Record<string, string> | undefined)?.form

  useEffect(() => {
    return router.on('start', () => toast.dismiss('flash'))
  }, [])

  useEffect(() => {
    if (flash.error) {
      toast.error(flash.error, { id: 'flash', duration: 6000 })
    }
    if (flash.success) {
      toast.success(flash.success, { id: 'flash' })
    }
  }, [flash])

  useEffect(() => {
    if (formError) {
      toast.error(formError, { id: 'form-error', duration: 6000 })
    }
  }, [formError])

  return <Toaster />
}
