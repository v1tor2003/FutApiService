import swaggerUi from 'swagger-ui-express'
import swaggerJSDoc from 'swagger-jsdoc'

import { Express } from 'express'

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Fut API',
    version: '1.0.0',
    description: 'API for serving football teams.',
  },
  servers: [
    {
      url: 'https://fut-api.vercel.app/api/v1',
      description: 'Production server on Vercel',
    },
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Development server',
    }
  ],
  paths: {
    '/teams/{id}': {
      get: {
        summary: 'Retrieve a team by its ID',
        description: 'Fetches the details of a team by its ID.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
              format: 'int32',
            },
            description: 'The ID of the team to retrieve.',
          },
        ],
        responses: {
          200: {
            description: 'Successful response with team data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      format: 'int32',
                    },
                    name: {
                      type: 'string',
                    },
                    shortName: {
                      type: 'string',
                      nullable: true,
                    },
                    tla: {
                      type: 'string',
                      nullable: true,
                    },
                    crest: {
                      type: 'string',
                      format: 'uri',
                    },
                    address: {
                      type: 'string',
                      nullable: true,
                    },
                    website: {
                      type: 'string',
                      format: 'uri',
                      nullable: true,
                    },
                    founded: {
                      type: 'integer',
                      format: 'int32',
                      nullable: true,
                    },
                    clubColors: {
                      type: 'string',
                      nullable: true,
                    },
                    venue: {
                      type: 'string',
                      nullable: true,
                    },
                    lastUpdated: {
                      type: 'string',
                      format: 'date-time',
                      nullable: true,
                    },
                  },
                  required: ['id', 'name', 'crest'],
                },
              },
            },
          },
          400: {
            description: 'Invalid team ID',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Team not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          500: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
          },
        },
      },
    },
  },
}

const options = {
  swaggerDefinition,
  apis: ['./index.ts']
}

const swaggerSpec = swaggerJSDoc(options)
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css"

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss:
        '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: CSS_URL,
  }))
}
