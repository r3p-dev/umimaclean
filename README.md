# Umima Clean

Shoe, bag and helmet cleaning service with pickup and delivery in Bandung Raya, built with AdonisJS, Inertia and React.

## Scheduled jobs

Two ace commands run outside the web server, started by systemd user timers that run them inside the app container (`umimaclean-web`) with `podman exec`.

| Timer | When | What it does |
| --- | --- | --- |
| `umimaclean-remind-payment.timer` | every 15 minutes | `node ace orders:remind-payment`: sends due WhatsApp payment reminders for unpaid online orders (24 hours after the bill, then every 2 days, only between 10:00 and 15:00 Asia/Jakarta). Safe to run repeatedly; a failed send is retried on the next run. Never calls Midtrans. |
| `umimaclean-prune-proofs.timer` | daily | `node ace proofs:prune`: deletes proof photos older than 90 days. |

The unit files are in [`deploy/systemd/`](deploy/systemd/). Install them on the server as user units:

```
cp deploy/systemd/umimaclean-* ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now umimaclean-remind-payment.timer umimaclean-prune-proofs.timer
systemctl --user list-timers 'umimaclean-*'
```

Read their logs:

```
journalctl --user -u umimaclean-remind-payment.service -n 50
journalctl --user -u umimaclean-prune-proofs.service -n 50
```

`Persistent=true` runs a missed job once after the server was down. The reminder command checks the 10:00–15:00 window itself, so its timer runs around the clock.
