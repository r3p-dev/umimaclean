import vine from '@vinejs/vine'

export const emailRule = () => vine.string().email().maxLength(254)

export const passwordRule = () => vine.string().minLength(8).maxLength(32)
