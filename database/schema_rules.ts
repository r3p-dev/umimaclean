import { type SchemaRules } from '@adonisjs/lucid/types/schema_generator'

export default {
  tables: {
    users: {
      columns: {
        role: {
          tsType: 'Role',
          imports: [
            {
              source: '#enums/role_enum',
              namedImports: ['type Role'],
            },
          ],
        },
      },
    },
    otp_codes: {
      columns: {
        purpose: {
          tsType: 'OtpPurpose',
          imports: [
            {
              source: '#enums/otp_purpose_enum',
              namedImports: ['type OtpPurpose'],
            },
          ],
        },
      },
    },
    services: {
      columns: {
        type: {
          tsType: 'ServiceType',
          imports: [
            {
              source: '#enums/service_type_enum',
              namedImports: ['type ServiceType'],
            },
          ],
        },
        item_kinds: {
          tsType: 'ItemKind[]',
          imports: [
            {
              source: '#enums/item_kind_enum',
              namedImports: ['type ItemKind'],
            },
          ],
        },
      },
    },
    service_areas: {
      columns: {
        boundary: {
          tsType: 'string | Record<string, unknown>',
        },
      },
    },
    orders: {
      columns: {
        status: {
          tsType: 'OrderStatus',
          imports: [{ source: '#enums/order_status_enum', namedImports: ['type OrderStatus'] }],
        },
      },
    },
    order_addresses: {
      columns: {
        kind: {
          tsType: 'OrderAddressKind',
          imports: [
            { source: '#enums/order_address_kind_enum', namedImports: ['type OrderAddressKind'] },
          ],
        },
      },
    },
    order_items: {
      columns: {
        item_kind: {
          tsType: 'ItemKind',
          imports: [{ source: '#enums/item_kind_enum', namedImports: ['type ItemKind'] }],
        },
      },
    },
    order_events: {
      columns: {
        status: {
          tsType: 'OrderStatus',
          imports: [{ source: '#enums/order_status_enum', namedImports: ['type OrderStatus'] }],
        },
      },
    },
    settings: {
      columns: {
        value: {
          tsType: 'Record<string, unknown> | unknown[] | string | number | boolean',
        },
      },
    },
  },
} satisfies SchemaRules
