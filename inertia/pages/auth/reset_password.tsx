import { Form, Link } from '@adonisjs/inertia/react'
import { IconArrowLeft } from '@tabler/icons-react'
import CsrfField from '~/components/atoms/csrf_field'
import PasswordInput from '~/components/molecules/password_input'
import SeoHead from '~/components/molecules/seo_head'
import AuthLayout from '~/components/templates/auth_layout'
import { Button } from '~/components/ui/button'

export default function ResetPassword({ maskedPhone }: { maskedPhone: string }) {
  return (
    <>
      <SeoHead
        title="Kata Sandi Baru"
        description="Buat kata sandi baru untuk akun Umima Clean Anda."
      />
      <h1 className="text-3xl font-bold tracking-tight">Buat Kata Sandi Baru</h1>
      <p className="mt-1 text-base text-muted-foreground">
        Nomor <span className="font-semibold text-foreground">{maskedPhone}</span> terverifikasi.
      </p>

      <Form route="password_reset.update" className="mt-8 flex flex-col gap-5">
        {({ errors, processing }) => (
          <>
            <CsrfField />

            <PasswordInput
              id="password"
              name="password"
              label="Kata sandi baru"
              autoComplete="new-password"
              error={errors.password}
              description="Minimal 8 karakter."
              required
            />

            <PasswordInput
              id="passwordConfirmation"
              name="passwordConfirmation"
              label="Ulangi kata sandi"
              autoComplete="new-password"
              error={errors.passwordConfirmation}
              required
            />

            <Button type="submit" isDisabled={processing} className="mt-2 h-14 text-base">
              {processing ? 'Menyimpan…' : 'Simpan & Masuk'}
            </Button>
          </>
        )}
      </Form>

      <Link
        route="home"
        className="mt-8 inline-flex min-h-11 items-center gap-2 self-start text-sm text-foreground/80 hover:text-foreground"
      >
        <IconArrowLeft className="size-4.5" />
        Kembali ke beranda
      </Link>
    </>
  )
}

ResetPassword.layout = [AuthLayout]
