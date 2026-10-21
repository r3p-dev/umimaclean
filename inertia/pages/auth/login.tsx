import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { urlFor } from '~/client'
import BackLink from '~/components/molecules/back_link'
import SignInForm from '~/components/organisms/auth/sign_in_form'
import AuthLayout from '~/components/templates/auth_layout'

export default function Login() {
  return (
    <>
      <Head title="Masuk" />
      <SignInForm
        action={urlFor('auth.login.store')}
        title="Masuk ke Umima Clean"
        description="Pakai nomor WhatsApp dan kata sandi yang Anda buat saat daftar."
        forgot={
          <Link
            href={urlFor('auth.password.forgot')}
            className="inline-flex min-h-icon-btn items-center text-sm font-semibold text-primary hover:text-primary-hover"
          >
            Lupa kata sandi?
          </Link>
        }
        footer={
          <p className="mt-4 text-center text-[15px] leading-normal text-foreground-secondary">
            Belum punya akun?{' '}
            <Link
              href={urlFor('auth.register')}
              className="inline-flex min-h-icon-btn items-center font-semibold text-primary hover:text-primary-hover"
            >
              Daftar
            </Link>
            <br />
            Staf?{' '}
            <Link
              href={urlFor('auth.staff_login')}
              className="inline-flex min-h-icon-btn items-center font-semibold text-primary hover:text-primary-hover"
            >
              Masuk di sini
            </Link>
          </p>
        }
      />
      <BackLink href={urlFor('home')} label="Kembali ke beranda" className="mt-2" />
    </>
  )
}

Login.layout = [AuthLayout]
