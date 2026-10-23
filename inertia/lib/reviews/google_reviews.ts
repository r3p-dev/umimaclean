type GoogleReview = {
  name: string
  rating: number
  text: string
  url: string
}

export const GOOGLE_RATING = 5

export const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    name: 'Adli F.',
    rating: 5,
    text: 'Muaaanntapp, Gila sih, sepatu yang udah belepotan lumpur bisa balik jadi kayak baru cuma di Umimma. Nggak ribet, cepet selesai, sama orangnya friendly banget. Seneng deh, jadi pengen cuci semua sepatu di sini terus.',
    url: 'https://maps.app.goo.gl/zpJaQnkDUfU2iaCL6',
  },

  {
    name: 'Totoro',
    rating: 5,
    text: 'beberapa kali cuci disini dari tas istri sampe sepatu saya, hasil repaint mid sole nya juga oke bgt, pokonya recommended banget deh 👍',
    url: 'https://maps.app.goo.gl/XxEthhibZpcWB2Qw8',
  },
  {
    name: 'Adryan A.',
    rating: 5,
    text: 'langganan dari 2021 dulu masih di baleendah , walaupun sekarang ngedrop sepatu jadi jauh , tapi bisa di pickup and delivery',
    url: 'https://maps.app.goo.gl/5oWreMyMXMF9e69r5',
  },
  {
    name: 'Rheinna T.',
    rating: 5,
    text: 'rekomendasi buat yang mau sepatu atau tas nya kinclong lagii, pelayanannya juga ramah pooll',
    url: 'https://maps.app.goo.gl/5wGkHHLGV5Yj2ueH6',
  },

  {
    name: 'Ria B.',
    rating: 5,
    text: 'Good service. Masnya edukatif. Ngasih tw bagian mana aja yg sulit dibersihkan dan yg riskan klo dipaksakan. Resultnya ttp maksimal. Trims umima',
    url: 'https://maps.app.goo.gl/q6AKS4PYi5PRNA446',
  },
  {
    name: 'Daviq F.',
    rating: 5,
    text: 'Rekomen sih, bisa cuci sepatu helm sama tas. Pengerjaan juga cepat, bersih dan detail 👍🏻 pegawainya juga ramah dan ga pelit ilmu, cocok buat berbagai macam sepatu bisa reparasi juga 👍🏻👍🏻👍🏻',
    url: 'https://maps.app.goo.gl/LTfMnXWhkAruEMbB6',
  },
  {
    name: 'Sendi M.',
    rating: 5,
    text: 'Tempat nya nyaman pelayanan nya ramah buat yang mau reglue jangan ragu terbaik pokonya',
    url: 'https://maps.app.goo.gl/rDcX5LjLqRfPA7Nu5',
  },
]

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
