export const swaggerOptions = {
  swagger: {
    info: {
      title: 'AURUM-911 API',
      description: 'Enterprise SaaS Platform API Documentation',
      version: '1.0.0',
      contact: {
        name: 'AURUM-911 Team',
        email: 'api@aurum.cool',
        url: 'https://aurum.cool'
      }
    },
    host: 'api.aurum.cool',
    schemes: ['https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
      Bearer: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'JWT token with Bearer prefix'
      }
    },
    tags: [
      { name: 'Authentication', description: 'Auth endpoints' },
      { name: 'HR', description: 'Human Resources' },
      { name: 'Analytics', description: 'Business Analytics' },
      { name: 'AI', description: 'Artificial Intelligence' },
      { name: 'Marketplace', description: 'App Marketplace' }
    ]
  },
  transform: ({ schema, url }) => {
    const transformed = { ...schema }
    transformed.host = process.env.API_HOST || 'localhost:3000'
    return transformed
  }
}

export const swaggerUiOptions = {
  routePrefix: '/docs',
  exposeRoute: true,
  staticCSP: true,
  transformStaticCSP: (header: string) => header,
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false
  }
}