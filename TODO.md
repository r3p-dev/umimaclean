# TO DO List

## Customer

- [] Not every order should sent WhatsApp.
  - [] Customer should only received WhatsApp when the order is created (for them to track status), when courier doing pickup, and the bills
  - [] Staff and Owner received WhatsApp cause they have the app
- [] Order Detail doesn't need the random UID. just straight order number, cause now we have account
- [] Address only 3
- [] Landing hero before/after slider should use real Umima.Clean photos (now Unsplash stock photos in `public/images/landing/shoes-before-*` and `shoes-after-*`)

## Staff

- [] Courier only one
- [] There are no staff type
- [] There are no shift either

## Admin / Owner

- [] I want when admin / owner add area by typing, the validations for pinpoint map is already there. so if Admin remove kecamatan Coblong, then the whole of Coblong is not valid for pickup delivery in the Pinpoint map. to make the system easier instead of adding or removing the pbf file

## System

- [] Custom error messages should be in #start/validator (https://docs.adonisjs.com/guides/basics/validation#customizing-error-messages)
- [] Remove custom exception and just throw Exception
- [] Remove any abstraction and make it straight and simple
- [] Separate seeders file. so when I wanna edit, I could just open the one I wanna edit instead of scrolling
- [] Migration should only be create, never use alter
- [] Explain the migration, why do you that
