export function orderNumber(id: number) {
  return `UMC-${String(id).padStart(5, '0')}`
}
