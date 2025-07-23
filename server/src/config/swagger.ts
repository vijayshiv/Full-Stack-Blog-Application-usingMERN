import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import config from "./index";

// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Blog Application API",
    version: "1.0.0",
    description:
      "A comprehensive REST API for a full-stack blog application built with Node.js, Express, and MySQL",
    contact: {
      name: "Blog API Support",
      email: "support@blogapp.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: `http://localhost:${config.server.port}`,
      description: "Development server",
    },
    {
      url: "https://your-production-url.com",
      description: "Production server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token",
      },
      tokenAuth: {
        type: "apiKey",
        in: "header",
        name: "token",
        description: "JWT token in header",
      },
    },
    schemas: {
      User: {
        type: "object",
        required: ["fullname", "email", "password"],
        properties: {
          id: {
            type: "integer",
            description: "Unique identifier for the user",
            example: 1,
          },
          fullname: {
            type: "string",
            description: "Full name of the user",
            example: "John Doe",
          },
          email: {
            type: "string",
            format: "email",
            description: "Email address of the user",
            example: "john.doe@example.com",
          },
          password: {
            type: "string",
            minLength: 6,
            description: "Password for the user account",
            example: "mypassword123",
          },
          createdTimestamp: {
            type: "string",
            format: "date-time",
            description: "Account creation timestamp",
            example: "2024-01-01T12:00:00.000Z",
          },
        },
      },
      Post: {
        type: "object",
        required: ["title", "desc", "category"],
        properties: {
          id: {
            type: "integer",
            description: "Unique identifier for the post",
            example: 1,
          },
          title: {
            type: "string",
            description: "Title of the blog post",
            example: "My First Blog Post",
          },
          desc: {
            type: "string",
            description: "Content/description of the blog post",
            example: "This is the content of my first blog post...",
          },
          category: {
            type: "string",
            description: "Category of the blog post",
            enum: [
              "technology",
              "lifestyle",
              "travel",
              "food",
              "sports",
              "education",
              "business",
              "entertainment",
              "health",
              "science",
              "art",
              "politics",
              "environment",
              "fashion",
              "music",
              "books",
              "cinema",
              "gaming",
              "finance",
              "photography",
              "design",
              "culture",
              "history",
              "nature",
              "other",
            ],
            example: "technology",
          },
          image: {
            type: "string",
            description: "Image filename for the post",
            example: "post-image.jpg",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Post creation timestamp",
            example: "2024-01-01T12:00:00.000Z",
          },
          userId: {
            type: "integer",
            description: "ID of the user who created the post",
            example: 1,
          },
          fullname: {
            type: "string",
            description: "Full name of the post author",
            example: "John Doe",
          },
        },
      },
      Comment: {
        type: "object",
        required: ["comment"],
        properties: {
          id: {
            type: "integer",
            description: "Unique identifier for the comment",
            example: 1,
          },
          comment: {
            type: "string",
            description: "Content of the comment",
            example: "Great post! Very informative.",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Comment creation timestamp",
            example: "2024-01-01T12:00:00.000Z",
          },
          userId: {
            type: "integer",
            description: "ID of the user who made the comment",
            example: 1,
          },
          postId: {
            type: "integer",
            description: "ID of the post being commented on",
            example: 1,
          },
          fullname: {
            type: "string",
            description: "Full name of the commenter",
            example: "Jane Smith",
          },
        },
      },
      Like: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "Unique identifier for the like",
            example: 1,
          },
          userId: {
            type: "integer",
            description: "ID of the user who liked the post",
            example: 1,
          },
          postId: {
            type: "integer",
            description: "ID of the post being liked",
            example: 1,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Like creation timestamp",
            example: "2024-01-01T12:00:00.000Z",
          },
        },
      },
      ApiResponse: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["success", "error"],
            description: "Response status",
            example: "success",
          },
          data: {
            description: "Response data (varies by endpoint)",
            example: {},
          },
          error: {
            type: "string",
            description: "Error message (only present when status is error)",
            example: "An error occurred",
          },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["success"],
            example: "success",
          },
          data: {
            type: "object",
            properties: {
              user: {
                $ref: "#/components/schemas/User",
              },
              token: {
                type: "string",
                description: "JWT authentication token",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["error"],
            example: "error",
          },
          error: {
            type: "string",
            description: "Error message describing what went wrong",
            example: "Missing Token",
          },
        },
        required: ["status", "error"],
      },
    },
    responses: {
      UnauthorizedError: {
        description: "Authentication information is missing or invalid",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: {
                  type: "string",
                  example: "error",
                },
                error: {
                  type: "string",
                  example: "Unauthorized access",
                },
              },
            },
          },
        },
      },
      NotFoundError: {
        description: "The requested resource was not found",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: {
                  type: "string",
                  example: "error",
                },
                error: {
                  type: "string",
                  example: "Resource not found",
                },
              },
            },
          },
        },
      },
      ValidationError: {
        description: "Invalid input provided",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: {
                  type: "string",
                  example: "error",
                },
                error: {
                  type: "string",
                  example: "Validation failed",
                },
              },
            },
          },
        },
      },
      ServerError: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
          },
        },
      },
    },
  },
};

// Options for the swagger docs
const options = {
  definition: swaggerDefinition,
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

// Swagger UI options
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: "none",
    filter: true,
    showRequestHeaders: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .scheme-container { background: #f7f7f7; padding: 15px; margin: 20px 0; border-radius: 4px }
  `,
  customSiteTitle: "Blog API Documentation",
  customfavIcon: "/assets/favicon.ico",
};

export { swaggerSpec, swaggerUi, swaggerUiOptions };
