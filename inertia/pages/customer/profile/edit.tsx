import { useRef, useState, type FormEvent } from 'react'
import { Head, router } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import type { Data } from '@generated/data'
import { urlFor } from '~/client'
import Overline from '~/components/atoms/overline'
import BackLink from '~/components/molecules/back_link'
import PasswordForm from '~/components/organisms/profile/password_form'
import ProfileShell from '~/components/organisms/profile/profile_shell'
import AccountLayout from '~/components/templates/account_layout'
import { Button } from '~/components/ui/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { nameError } from '~/lib/shared/validation'

const CARD = 'flex flex-col gap-4.5 rounded-lg border border-border bg-card p-5 sm:p-6'

function NameForm({ user }: { user: Data.User }) {
  const [name, setName] = useState(user.name)
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setBusy] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  function submit(event: FormEvent) {
    event.preventDefault()
    if (isBusy) {
      return
    }
    const problem = nameError(name)
    setError(problem)
    if (problem) {
      return nameRef.current?.focus()
    }
    router.put(
      urlFor('customer.profile.update'),
      { name },
      {
        preserveScroll: true,
        onStart: () => setBusy(true),
        onError: (errors) => setError(errors.name ?? null),
        onFinish: () => setBusy(false),
      }
    )
  }

  return (
    <form onSubmit={submit} noValidate aria-labelledby="profile-data-title" className={CARD}>
      <Overline as="h2" id="profile-data-title">
        Data diri
      </Overline>
      <Field>
        <FieldLabel htmlFor="profile-name">Nama</FieldLabel>
        <Input
          ref={nameRef}
          id="profile-name"
          autoComplete="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value.slice(0, 80))
            if (error) {
              setError(null)
            }
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'profile-name-error' : undefined}
        />
        {error && <FieldError id="profile-name-error">{error}</FieldError>}
      </Field>
      <Field>
        <FieldLabel id="profile-phone-label">Nomor WhatsApp</FieldLabel>
        <div
          aria-labelledby="profile-phone-label"
          className="flex h-12.5 items-center justify-between gap-3 rounded-md bg-muted pr-1 pl-3.5"
        >
          <span className="text-base">{user.phone}</span>
          <Link
            href={urlFor('customer.phone.edit')}
            aria-label="Ganti nomor WhatsApp"
            className="inline-flex min-h-icon-btn items-center px-2.5 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            Ganti
          </Link>
        </div>
        <FieldDescription>Ganti nomor perlu verifikasi WhatsApp di nomor baru.</FieldDescription>
      </Field>
      <Button
        type="submit"
        size="desktop"
        className="self-start px-4 max-sm:h-btn max-sm:w-full"
        isPending={isBusy}
      >
        {isBusy ? 'Menyimpan…' : 'Simpan Data Diri'}
      </Button>
    </form>
  )
}

export default function ProfileEdit({ user }: { user: Data.User }) {
  return (
    <>
      <Head title="Ubah Profil" />
      <ProfileShell
        active="keamanan"
        title="Ubah profil"
        back={<BackLink href={urlFor('customer.profile.show')} label="Profil" />}
      >
        <div className="mt-4 grid items-start gap-4 xl:grid-cols-2">
          <NameForm user={user} />
          <PasswordForm action={urlFor('customer.password.update')} />
        </div>
      </ProfileShell>
    </>
  )
}

ProfileEdit.layout = [AccountLayout]
