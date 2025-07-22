const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('./index');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Blog Application API',
    version: '1.0.0',
    description: 'A comprehensive REST API for a full-stack blog application built with Node.js, Express, and MySQL',
    contact: {
      name: 'Blog API Support',
      email: 'support@blogapp.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: `http://localhost:${config.server.port}`,
      description: 'Development server'
    },
    {
      url: 'https://your-production-url.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token'
      },
      tokenAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'token',
        description: 'JWT token in header'
      }
    },
    schemas: {
      User: {
        type: 'object',
        required: ['fullname', 'email', 'password'],
        properties: {
          id: {
            type: 'integer',
            description: 'User ID',
            example: 1
          },
          fullname: {
            type: 'string',
            description: 'Full name of the user',
            example: 'John Doe',
            minLength: 2,
            maxLength: 100
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email address',
            example: 'john.doe@example.com'
          },
          password: {
            type: 'string',
            description: 'Password (min 6 characters)',
            example: 'password123',
            minLength: 6,
            maxLength: 128
          },
          createdTimestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation timestamp'
          }
        }
      },
      Post: {
        type: 'object',
        required: ['title', 'content', 'category'],
        properties: {
          post_id: {
            type: 'integer',
            description: 'Post ID',
            example: 1
          },
          title: {
            type: 'string',
            description: 'Post title',
            example: 'My First Blog Post',
            minLength: 3,
            maxLength: 200
          },
          content: {
            type: 'string',
            description: 'Post content (HTML supported)',
            example: '<p>This is my first blog post content...</p>',
            minLength: 10
          },
          category: {
            type: 'string',
            description: 'Post category',
            example: 'Technology',
            maxLength: 50
          },
          image: {
            type: 'string',
            description: 'Image filename',
            example: 'post-image.jpg'
          },
          user_id: {
            type: 'integer',
            description: 'Author user ID',
            example: 1
          },
          createdTimestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Post creation timestamp'
          },
          author: {
            type: 'string',
            description: 'Author full name',
            example: 'John Doe'
          }
        }
      },
      Comment: {
        type: 'object',
        required: ['content'],
        properties: {
          comment_id: {
            type: 'integer',
            description: 'Comment ID',
            example: 1
          },
          content: {
            type: 'string',
            description: 'Comment content',
            example: 'Great post! Thanks for sharing.',
            minLength: 1,
            maxLength: 1000
          },
          post_id: {
            type: 'integer',
            description: 'Associated post ID',
            example: 1
          },
          user_id: {
            type: 'integer',
            description: 'Commenter user ID',
            example: 2
          },
          fullname: {
            type: 'string',
            description: 'Commenter full name',
            example: 'Jane Smith'
          },
          createdTimestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Comment creation timestamp'
          }
        }
      },
      ApiResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: ['success', 'error'],
            description: 'Response status'
          },
          data: {
            type: 'object',
            description: 'Response data (for success)'
          },
          error: {
            type: 'string',
            description: 'Error message (for error)'
          }
        }
      },
      ValidationError: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error'
          },
          error: {
            type: 'string',
            example: 'Email is required, Password must be at least 6 characters long'
          }
        }
      },
      AuthError: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error'
          },
          error: {
            type: 'string',
            example: 'Invalid Token'
          }
        }
      },
      RateLimitError: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error'
          },
          error: {
            type: 'string',
            example: 'Too many requests. Try again in 300 seconds.'
          }
        }
      }
    },
    responses: {
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ValidationError'
            }
          }
        }
      },
      AuthError: {
        description: 'Authentication error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/AuthError'
            }
          }
        }
      },
      RateLimitError: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/RateLimitError'
            }
          }
        }
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  example: 'error'
                },
                error: {
                  type: 'string',
                  example: 'Post not found'
                }
              }
            }
          }
        }
      }
    }
  }
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: [
    './routes/*.js',
    './controllers/*.js',
    './middleware/*.js'
  ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

// Swagger UI options
const swaggerUiOptions = {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .scheme-container { background: #f7f7f7; }
  `,
  customSiteTitle: "Blog API Documentation",
  customfavIcon: "/images/favicon.ico"
};

module.exports = {
  swaggerSpec,
  swaggerUi,
  swaggerUiOptions
};
