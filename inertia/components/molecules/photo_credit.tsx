// Credit the CC BY-SA licenses of the landing photos require (docs/DEPENDENCIES.md §4, GUEST-1).
const LINK = 'underline underline-offset-2 hover:text-foreground'

export default function PhotoCredit() {
  return (
    <p className="border-t border-border py-4 text-sm text-muted-foreground">
      Foto:{' '}
      <a
        href="https://commons.wikimedia.org/wiki/File:Muddy_white_shoes.jpg"
        target="_blank"
        rel="noreferrer"
        className={LINK}
      >
        Pavel Ševela
      </a>{' '}
      (CC BY-SA 3.0),{' '}
      <a
        href="https://commons.wikimedia.org/wiki/File:A_pair_of_white_shoes.jpg"
        target="_blank"
        rel="noreferrer"
        className={LINK}
      >
        JustinLiang522
      </a>{' '}
      (CC BY-SA 4.0), via Wikimedia Commons
    </p>
  )
}
