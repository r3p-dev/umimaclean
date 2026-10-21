import { inject } from '@adonisjs/core'
import type { TransactionClientContract } from '@adonisjs/lucid/types/database'
import type { ItemKind } from '#enums/order_enum'
import Bill from '#models/bill'
import BillLine from '#models/bill_line'
import type Order from '#models/order'
import OrderItem from '#models/order_item'
import type User from '#models/user'
import CatalogService, { type ItemSelection } from '#services/catalog_service'

export type InspectedItem = {
  kind: ItemKind
  name: string
  note?: string | null
  services: ItemSelection
}

@inject()
export default class BillingService {
  constructor(protected catalog: CatalogService) {}

  async replace(
    order: Order,
    items: InspectedItem[],
    staff: User,
    transaction: TransactionClientContract
  ) {
    const priced = []
    for (const [index, item] of items.entries()) {
      priced.push({
        item,
        services: await this.catalog.resolve(
          item.kind,
          item.services,
          `items.${index}.services`,
          transaction
        ),
      })
    }

    await OrderItem.query({ client: transaction }).where('order_id', order.id).delete()
    await Bill.query({ client: transaction }).where('order_id', order.id).delete()

    const total = priced.reduce(
      (sum, entry) => sum + entry.services.reduce((lineSum, service) => lineSum + service.price, 0),
      0
    )
    const bill = await Bill.create(
      { orderId: order.id, total, decidedBy: staff.id },
      { client: transaction }
    )

    for (const [index, entry] of priced.entries()) {
      const orderItem = await OrderItem.create(
        {
          orderId: order.id,
          kind: entry.item.kind,
          name: entry.item.name,
          note: entry.item.note ?? '',
          position: index + 1,
        },
        { client: transaction }
      )
      await BillLine.createMany(
        entry.services.map((service) => ({
          billId: bill.id,
          orderItemId: orderItem.id,
          serviceId: service.id,
          serviceType: service.type,
          name: service.name,
          price: service.price,
        })),
        { client: transaction }
      )
    }

    return bill
  }
}
