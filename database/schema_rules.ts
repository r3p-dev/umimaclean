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
  },
} satisfies SchemaRules
