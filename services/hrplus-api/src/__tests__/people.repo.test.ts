import { InMemoryPeopleRepo } from '../repo/people'

describe('InMemoryPeopleRepo', () => {
  it('should create, get, list and update a person', async () => {
    const repo = new InMemoryPeopleRepo()
    const tenant = 't-1'
    const created = await repo.create(tenant, { first_name: 'Ana', last_name: 'Silva', email: 'ana@example.com' })
    expect(created.id).toBeDefined()

    const got = await repo.get(tenant, created.id)
    expect(got?.email).toBe('ana@example.com')

    const list = await repo.list(tenant, 1, 10)
    expect(list.total).toBe(1)

    const updated = await repo.update(tenant, created.id, { last_name: 'Souza' })
    expect(updated?.last_name).toBe('Souza')
  })
})
