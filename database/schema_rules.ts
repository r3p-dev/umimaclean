import { type SchemaRules } from '@adonisjs/lucid/types/schema_generator'

function enumColumn(type: string, source: string, isNullable = false) {
  return {
    tsType: isNullable ? `${type} | null` : type,
    decorators: [{ name: '@column' }],
    imports: [{ source, namedImports: [type] }],
  }
}

function jsonColumn(type: string, source?: string) {
  return {
    tsType: type,
    imports: source ? [{ source, namedImports: [type.replace('[]', '')] }] : [],
    decorators: [
      {
        name: '@column',
        args: { prepare: (value: unknown) => JSON.stringify(value) },
      },
    ],
  }
}

const ORDER = '#enums/order_enum'
const PAYMENT = '#enums/payment_enum'

export default {
  tables: {
    users: {
      columns: {
        role: enumColumn('Role', '#enums/role_enum'),
        password: {
          tsType: 'string',
          decorators: [{ name: '@column', args: { serializeAs: null } }],
        },
      },
    },

    otp_codes: {
      columns: {
        purpose: enumColumn('OtpPurpose', '#enums/otp_enum'),
      },
    },

    orders: {
      columns: {
        status: enumColumn('OrderStatus', ORDER),
        source: enumColumn('OrderSource', ORDER),
        return_method: enumColumn('ReturnMethod', ORDER),
      },
    },

    order_addresses: {
      columns: {
        type: enumColumn('OrderAddressType', ORDER),
      },
    },

    order_events: {
      columns: {
        status: enumColumn('OrderStatus', ORDER),
      },
    },

    order_items: {
      columns: {
        kind: enumColumn('ItemKind', ORDER),
      },
    },

    order_photos: {
      columns: {
        kind: enumColumn('PhotoKind', ORDER),
      },
    },

    services: {
      columns: {
        type: enumColumn('ServiceType', '#enums/service_enum'),
        categories: jsonColumn('ItemKind[]', ORDER),
      },
    },

    payments: {
      columns: {
        channel: enumColumn('PaymentChannel', PAYMENT),
        method: enumColumn('PaymentMethod', PAYMENT),
        status: enumColumn('PaymentStatus', PAYMENT),
      },
    },

    activity_logs: {
      columns: {
        action: enumColumn('ActivityAction', '#enums/activity_enum'),
      },
    },

    whatsapp_messages: {
      columns: {
        purpose: enumColumn('MessagePurpose', '#enums/message_enum'),
        status: enumColumn('MessageStatus', '#enums/message_enum'),
      },
    },

    operating_costs: {
      columns: {
        category: enumColumn('CostCategory', '#enums/cost_enum'),
      },
    },

    settings: {
      columns: {
        value: jsonColumn('unknown'),
      },
    },
  },
} satisfies SchemaRules
