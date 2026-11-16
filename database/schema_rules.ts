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
    settings: {
      columns: {
        value: {
          tsType: 'Record<string, unknown> | unknown[] | string | number | boolean',
        },
      },
    },
  },
} satisfies SchemaRules
