describe('Test Setup', () => {
  it('should run basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have access to Jest globals', () => {
    expect(jest).toBeDefined()
    expect(describe).toBeDefined()
    expect(it).toBeDefined()
    expect(expect).toBeDefined()
  })

  it('should have mocked environment variables', () => {
    expect(process.env.NEXTAUTH_SECRET).toBe('test-secret')
    expect(process.env.NEXTAUTH_URL).toBe('http://localhost:3000')
    expect(process.env.DATABASE_URL).toBe('postgresql://test:test@localhost:5432/test')
  })
})