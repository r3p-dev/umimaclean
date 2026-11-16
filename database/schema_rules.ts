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
  },
} satisfies SchemaRules
