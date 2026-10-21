import { Head } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { urlFor } from '~/client'
import SignInForm from '~/components/organisms/auth/sign_in_form'
import AuthLayout from '~/components/templates/auth_layout'

export default function StaffLogin() {
  return (
    <>
      <Head title="Masuk Staf" />
      <SignInForm
        action={urlFor('auth.staff_login.store')}
        title="Masuk staf & owner"
        description="Pakai nomor WhatsApp dan kata sandi akun staf Anda."
        forgot={
          <Link
            href={urlFor('auth.password.forgot')}
            className="inline-flex min-h-icon-btn items-center text-sm font-semibold text-primary hover:text-primary-hover"
          >
            Lupa kata sandi?
          </Link>
        }
      />
    </>
  )
}

StaffLogin.layout = [AuthLayout]
