import { test } from '@japa/runner'
import { Bouncer } from '@adonisjs/bouncer'
import { accessCustomer, accessStaff, accessAdmin } from '#abilities/main'
import User from '#models/user'
import { Role } from '#enums/role_enum'

const abilities = { accessCustomer, accessStaff, accessAdmin }

test.group('Bouncer abilities', () => {
  test('accessCustomer allows customer and denies staff and admin', async ({ assert }) => {
    const customer = new User()
    customer.role = Role.CUSTOMER

    const staff = new User()
    staff.role = Role.STAFF

    const admin = new User()
    admin.role = Role.ADMIN

    const bouncerCustomer = new Bouncer(() => customer, abilities, {})
    const bouncerStaff = new Bouncer(() => staff, abilities, {})
    const bouncerAdmin = new Bouncer(() => admin, abilities, {})
    const bouncerGuest = new Bouncer(() => null as User | null, abilities, {})

    assert.isTrue(await bouncerCustomer.allows(abilities.accessCustomer))
    assert.isFalse(await bouncerStaff.allows(abilities.accessCustomer))
    assert.isFalse(await bouncerAdmin.allows(abilities.accessCustomer))
    assert.isFalse(await bouncerGuest.allows(abilities.accessCustomer))
  })

  test('accessStaff allows staff and admin, denies customer and guest', async ({ assert }) => {
    const customer = new User()
    customer.role = Role.CUSTOMER

    const staff = new User()
    staff.role = Role.STAFF

    const admin = new User()
    admin.role = Role.ADMIN

    const bouncerCustomer = new Bouncer(() => customer, abilities, {})
    const bouncerStaff = new Bouncer(() => staff, abilities, {})
    const bouncerAdmin = new Bouncer(() => admin, abilities, {})
    const bouncerGuest = new Bouncer(() => null as User | null, abilities, {})

    assert.isFalse(await bouncerCustomer.allows(abilities.accessStaff))
    assert.isTrue(await bouncerStaff.allows(abilities.accessStaff))
    assert.isTrue(await bouncerAdmin.allows(abilities.accessStaff))
    assert.isFalse(await bouncerGuest.allows(abilities.accessStaff))
  })

  test('accessAdmin allows only admin', async ({ assert }) => {
    const customer = new User()
    customer.role = Role.CUSTOMER

    const staff = new User()
    staff.role = Role.STAFF

    const admin = new User()
    admin.role = Role.ADMIN

    const bouncerCustomer = new Bouncer(() => customer, abilities, {})
    const bouncerStaff = new Bouncer(() => staff, abilities, {})
    const bouncerAdmin = new Bouncer(() => admin, abilities, {})

    assert.isFalse(await bouncerCustomer.allows(abilities.accessAdmin))
    assert.isFalse(await bouncerStaff.allows(abilities.accessAdmin))
    assert.isTrue(await bouncerAdmin.allows(abilities.accessAdmin))
  })
})
