# User Authentication Microservice Documentation

## Overview

This **User Authentication Microservice** is designed to handle user authentication and management functionalities following Clean Architecture principles. It focuses on separation of concerns, scalability, maintainability, and testability. The service is containerized using Docker to provide flexibility in deployment and is designed to integrate secure authentication mechanisms.

### Real-World Context

In a typical enterprise application, user authentication is a critical component. It ensures that only authorized users can access certain functionalities, protecting sensitive data and actions. For example, in an e-commerce application, only authenticated users should be able to view their order history or make a purchase. A well-structured authentication microservice helps achieve this by providing mechanisms such as sign-up, login, password management, and token-based authentication (JWT).

By following **Clean Architecture**, the service ensures the application remains modular, with different components (like database, business logic, and framework-specific code) separated into different layers. This improves maintainability, allows easy testing, and facilitates scaling the service when needed.

## Project Structure

The project is organized in a modular, layered architecture with a clear separation of concerns. Here's an explanation of the folder structure:

```
user-auth-service/
├── logs/                      # Application logs for tracking and troubleshooting
├── src/
│   ├── config/                # Configuration files for environment and database setup
│   ├── data-access/           # Data access layer - handles database interactions
│   ├── entities/              # Business entities - definitions for user-related objects
│   ├── frameworks/            # Framework-specific code (e.g., Express, JWT)
│   ├── interfaces/            # Interface adapters - for controllers, repositories, and validation
│   ├── use-cases/             # Application business logic - implements the core use cases
│   └── server.js              # Application entry point
├── tests/                     # Unit and integration tests
└── docker/                    # Docker-related files for containerization
```

### Breakdown of the Structure

#### 1. **Logs (`logs/`)**

Logs are essential for tracking application behavior, troubleshooting, and monitoring. This directory contains all the log files, which can include access logs, error logs, or custom logs for debugging.

**Why:**

- It allows developers and operators to diagnose issues in real-time.
- Critical operations and errors are logged to ensure traceability and auditability.

#### 2. **Source Code (`src/`)**

This is the core folder of the application where all business logic and implementation reside. It follows Clean Architecture principles, which separate concerns into distinct layers:

##### **Config (`src/config/`)**

- **`config.js`**: Stores environment-specific configurations such as the app's port number, the JWT secret, and other configurations.
- **`database.js`**: Contains database-related configurations like database host, port, and credentials.

**Why:**

- Configuration files allow for easy customization depending on the deployment environment (development, production, etc.).
- Centralized configuration reduces the risk of inconsistencies across different services.

##### **Data Access Layer (`src/data-access/`)**

Handles all interactions with the database using ORM (e.g., Sequelize with Postgres).

- **`sequelize/`**: Contains ORM configuration, migration files, models, and seeders to structure the database schema.
- **Models**: Define the structure of the database entities (e.g., User, Role).

**Why:**

- Decouples the application’s business logic from the underlying database.
- Simplifies database interactions with models and repositories, making code more modular and easier to maintain.

##### **Entities (`src/entities/`)**

Defines business entities, representing core objects in the application.

- **`user.entity.js`**: Represents a user, including properties like email, password, and role.

**Why:**

- Business entities represent real-world concepts and encapsulate business logic for validation and transformation.
- In Clean Architecture, entities contain the business rules and should remain independent of frameworks or external systems.

##### **Frameworks Layer (`src/frameworks/`)**

Contains implementations specific to external libraries or frameworks used in the application, such as logging, web servers, or external services like JWT.

- **`webserver/`**: Contains Express.js setup, routing, and middleware.
- **`services/`**: Integrates external services like JWT generation, email services, or third-party APIs.
- **`logger/`**: Implements logging using libraries like Winston or Bunyan.

**Why:**

- Framework-specific code should be isolated in this layer to facilitate testing and replaceability with minimal impact on the business logic.
- Keeps the core application logic decoupled from third-party dependencies.

##### **Interfaces Layer (`src/interfaces/`)**

Provides the mechanism for data transfer between external actors (users, external systems) and the core application logic.

- **`controllers/`**: Handles HTTP requests and interacts with use cases.
- **`repositories/`**: Defines methods to interact with the data access layer (e.g., fetching a user from the database).
- **`middlewares/`**: Implements middleware for authentication, authorization, and input validation.
- **`validators/`**: Contains input validation logic (e.g., checking if an email address is valid).

**Why:**

- The interfaces layer serves as the bridge between the outer layers (such as HTTP requests) and the core business logic.
- It ensures that external interactions (HTTP requests, input validation, etc.) are handled properly before they reach the application logic.

##### **Use Cases Layer (`src/use-cases/`)**

Contains the application's core business rules, orchestrating data flow between entities and repositories.

- **`sign-in.use-case.js`**: Contains the logic for handling user sign-in, including checking credentials and generating a JWT.

**Why:**

- Use cases are the central piece of Clean Architecture and handle the application-specific business rules.
- They are reusable, testable, and independent of frameworks and external systems.

##### **Application Entry Point (`src/server.js`)**

The entry point of the application where the Express server is set up, routes are defined, and the application starts running.

**Why:**

- Centralizes server configuration and initialization, providing a single place for bootstrapping the application.

#### 3. **Docker (`docker/`)**

Contains Docker-related configurations for containerizing the application. It includes the Dockerfile and docker-compose files to define how the application is built and deployed in containers.

**Why:**

- Docker allows the service to run consistently across different environments (local, staging, production), making deployment and scaling much easier.

#### 4. **Tests (`tests/`)**

Contains unit and integration tests to ensure the reliability of the application. It includes tests for use cases, controllers, and repositories.

**Why:**

- Tests ensure the correctness of the business logic, prevent regressions, and improve code quality.
- Using unit and integration tests helps catch errors early and improve the maintainability of the codebase.

---

## Core Components Explained in Real-World Context

### 1. **User Authentication Use Case**

In the real world, when a user logs in, the system must validate the user's credentials and return a secure authentication token (JWT). This use case is implemented as follows:

- **Controller** receives the HTTP request with the user's credentials.
- **Use Case** verifies the credentials using the **User Repository** and **Password Service**.
- If credentials are valid, a JWT token is generated and sent back to the user.

### 2. **Secure Authentication**

Secure authentication (JWT, bcrypt hashing, rate limiting) is implemented in the **services** and **middlewares** folders. JWT ensures that only authenticated users can access protected resources, while bcrypt handles password encryption, ensuring passwords are never stored in plain text.

### 3. **Role-based Access Control (RBAC)**

Roles (admin, user, etc.) can be included in the **user.entity.js** and used in **use-cases** to enforce specific permissions. For example, only admins should be allowed to view or modify user data.

### 4. **Database Migration and Seeding**

Migrations help manage changes to the database schema over time. Seeders can populate the database with initial test data, such as default user roles.

---

## Adding New Features - Example

### Example: Implementing Sign-In

1. **Add Entity Methods**

   - Modify the `User` entity to include methods for validating credentials.

2. **Create Use Case**

   - The `SignInUseCase` is responsible for orchestrating the sign-in process, ensuring credentials are valid and generating a JWT.

3. **Add Repository Method**

   - The `UserRepository` is responsible for fetching the user from the database by email.

4. **Add Controller Method**

   - The `UserController` handles the HTTP request for sign-in and calls the `SignInUseCase`.

5. **Add Route**
   - The route `/api/auth/sign-in` is added to handle POST requests.

---

## Best Practices

1. **Error Handling**

   - Custom error classes and middleware should be used to return consistent error responses.

2. **Security**

   - Use encryption, CORS, rate limiting, and input validation to protect the service from common security threats.

3. **Code Organization**
   - Clean Architecture encourages separation of concerns, making the codebase modular and easy to test, modify, and scale.

---

## Contributing

1. Follow the architecture principles.
2. Ensure thorough testing of new features.
3. Maintain consistent coding style and documentation.

I'll create comprehensive documentation explaining the user authentication microservice architecture, including detailed explanations for each component and how to implement new features like sign-in.

# User Authentication Microservice Documentation

## Overview

This microservice handles user authentication and management functionalities following Clean Architecture principles. The service is containerized using Docker and implements secure authentication mechanisms.

## Project Structure

```
user-auth-service/
├── logs/                      # Application logs
├── src/
│   ├── config/               # Configuration files
│   │   ├── config.js         # Environment-specific configurations
│   │   └── database.js       # Database configuration
│   ├── data-access/          # Data access layer
│   │   └── sequelize/        # Sequelize ORM implementation
│   │       ├── config/       # Database configurations
│   │       ├── migrations/   # Database migrations
│   │       ├── models/       # Sequelize models
│   │       └── seeders/      # Database seeders
│   ├── entities/             # Business entities
│   │   └── user.entity.js    # User entity definition
│   ├── frameworks/           # Framework-specific code
│   │   ├── database/        # Database implementations
│   │   ├── logger/          # Logging implementations
│   │   ├── services/        # External services
│   │   └── webserver/       # Express.js setup
│   ├── interfaces/          # Interface adapters
│   │   ├── controllers/     # Route controllers
│   │   ├── middlewares/     # Express middlewares
│   │   ├── repositories/    # Data repositories
│   │   └── validators/      # Input validation
│   ├── use-cases/          # Application business rules
│   └── server.js           # Application entry point
├── tests/                  # Test files
└── docker/                 # Docker configuration
```

## Core Components

### 1. Entities Layer (`src/entities/`)

Contains enterprise business rules and entities.

**user.entity.js**

```javascript
class User {
  constructor({ id, email, password, firstName, lastName, role }) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.firstName = firstName;
    this.lastName = lastName;
    this.role = role;
  }

  // Business rules and validations
}
```

### 2. Use Cases Layer (`src/use-cases/`)

Implements application business rules and orchestrates data flow.

Example use case for sign-in:

```javascript
class SignInUseCase {
  constructor(userRepository, passwordService, jwtService) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
    this.jwtService = jwtService;
  }

  async execute(email, password) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    const isValid = await this.passwordService.comparePassword(
      password,
      user.password
    );
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    return this.jwtService.generateToken(user);
  }
}
```

### 3. Interface Adapters Layer (`src/interfaces/`)

#### Controllers (`controllers/`)

Handle HTTP request/response logic.

**user.controller.js**

```javascript
class UserController {
  constructor(userRepository, signInUseCase) {
    this.userRepository = userRepository;
    this.signInUseCase = signInUseCase;
  }

  async signIn(req, res) {
    try {
      const { email, password } = req.body;
      const token = await this.signInUseCase.execute(email, password);
      res.json({ token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
```

#### Repositories (`repositories/`)

Implement data access patterns.

**user.repository.js**

```javascript
class UserRepository {
  constructor(UserModel) {
    this.UserModel = UserModel;
  }

  async findByEmail(email) {
    return this.UserModel.findOne({ where: { email } });
  }
}
```

### 4. Frameworks Layer (`src/frameworks/`)

#### Services (`services/`)

Implement external service integrations.

**jwt.service.js**

```javascript
class JWTService {
  constructor(secret) {
    this.secret = secret;
  }

  generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, this.secret, {
      expiresIn: "24h",
    });
  }
}
```

## Adding New Features

### Example: Implementing Sign-In

1. **Add Entity Methods** (if needed)

```javascript
// src/entities/user.entity.js
class User {
  validateCredentials(password) {
    // Implement validation logic
  }
}
```

2. **Create Use Case**

```javascript
// src/use-cases/sign-in.use-case.js
class SignInUseCase {
  // Implementation as shown above
}
```

3. **Add Repository Method** (if needed)

```javascript
// src/interfaces/repositories/user.repository.js
class UserRepository {
  async findByCredentials(email, password) {
    // Implementation
  }
}
```

4. **Add Controller Method**

```javascript
// src/interfaces/controllers/user.controller.js
class UserController {
  async signIn(req, res) {
    // Implementation as shown above
  }
}
```

5. **Add Route**

```javascript
// src/frameworks/webserver/routes/user.routes.js
router.post("/sign-in", userController.signIn.bind(userController));
```

## API Endpoints

### Authentication

- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### User Management

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `POST /api/users/verify-email` - Verify email address

## Database Migrations

Run migrations:

```bash
npm run migrate
```

Create new migration:

```bash
npx sequelize-cli migration:generate --name migration-name
```

## Environment Variables

```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=user_auth_db
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your-jwt-secret
```

## Docker Deployment

Build the image:

```bash
docker build -t user-auth-service .
```

Run the container:

```bash
docker run -p 3000:3000 user-auth-service
```

## Running Tests

```bash
npm run test
```

## Best Practices

1. **Error Handling**

   - Use custom error classes
   - Implement global error middleware
   - Return consistent error responses

2. **Security**

   - Implement rate limiting
   - Use CORS
   - Validate all inputs
   - Implement proper password hashing
   - Use secure session management

3. **Logging**

   - Use structured logging
   - Implement request tracking
   - Log all critical operations

4. **Code Organization**
   - Follow Clean Architecture principles
   - Keep concerns separated
   - Use dependency injection
   - Maintain consistent naming conventions

## Common Tasks

### Adding New Endpoints

1. Create necessary entity methods
2. Implement use case
3. Add repository methods
4. Create controller method
5. Add route
6. Add validation middleware
7. Update documentation

### Database Changes

1. Create migration
2. Update model
3. Update repository
4. Update entity
5. Test changes
6. Update documentation

## Troubleshooting

Common issues and solutions:

1. **Database Connection Issues**

   - Check connection string
   - Verify database credentials
   - Ensure database service is running

2. **Authentication Failures**

   - Verify JWT secret
   - Check token expiration
   - Validate request headers

3. **Migration Issues**
   - Check migration order
   - Verify database permissions
   - Review migration logs

## Contributing

1. Follow the established architecture
2. Write tests for new features
3. Update documentation
4. Follow coding standards
5. Submit detailed pull requests

```dockerfile
# Base image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]

```

This documentation provides a comprehensive guide for the user authentication microservice. Here are some key points to keep in mind when implementing new features:

1. Follow the Clean Architecture pattern - keep business logic separate from framework code
2. Implement proper validation and error handling
3. Maintain security best practices
4. Keep documentation updated

Would you like me to:

1. Provide more detailed code examples for any specific component?
2. Explain the implementation of a specific feature?
3. Add more details about any particular section?
