# 1. Project Setup and Architecture

## 1.1 Introduction

Universal Digital Khata is a digital ledger application designed to help small shop owners manage their daily credit transactions and customer records.

In traditional shops, business owners often maintain customer credit records in physical notebooks. This method can become difficult when the number of customers and transactions increases.

Our goal is to build a digital solution that makes this process easier, faster, and more organized.

Before implementing the main features, we created a proper project structure by separating the frontend and backend.

## 1.2 Why Did We Create This Project?

Traditional shopkeepers face several problems while managing customer credit:

- Maintaining customer records manually takes time.
- Finding previous transactions can be difficult.
- Calculating pending amounts manually can lead to mistakes.
- Managing multiple customers in a notebook becomes complicated.
- Shop owners cannot easily access their business records digitally.

We decided to build Universal Digital Khata to solve these problems through a simple digital platform.

## 1.3 Technology Stack

We selected different technologies for the frontend and backend based on their responsibilities.

| Technology | Purpose |
|---|---|
| Next.js | Building the frontend application |
| TypeScript | Writing safer and more maintainable frontend code |
| Tailwind CSS | Styling the user interface |
| Python | Backend programming language |
| FastAPI | Building backend APIs |
| Git | Tracking code changes |
| GitHub | Hosting and managing the source code |

The database and other integrations are explained in their respective modules.

## 1.4 Frontend Setup – Next.js

The frontend is the part of the application that users interact with.

We selected Next.js because it provides a structured React-based framework for building modern web applications.

The frontend is responsible for:

- Displaying application pages.
- Providing forms and user input fields.
- Showing customer and transaction information.
- Displaying dashboard information.
- Communicating with backend APIs.
- Providing a responsive user experience.

We use TypeScript to improve code reliability and make it easier to maintain the application.

We use Tailwind CSS to create consistent layouts and responsive designs.

### Why Next.js?

Next.js provides a structured way to build React applications. It also supports features such as routing, server-side rendering, and optimized application delivery.

For this project, it provides a strong foundation for building the frontend.

## 1.5 Backend Setup – FastAPI

The backend handles the application's business logic and data-related operations.

We selected FastAPI as our Python backend framework.

The backend is responsible for:

- Receiving requests from the frontend.
- Processing application logic.
- Validating incoming data.
- Communicating with the database.
- Returning responses to the frontend.
- Providing APIs for different application features.

### Why FastAPI?

We selected FastAPI for the following reasons:

- It is built using Python.
- It supports asynchronous programming.
- It provides automatic API documentation.
- It supports request and response validation.
- It is suitable for building REST APIs.
- Python also allows us to integrate AI and machine learning features.

## 1.6 Frontend and Backend Separation

We maintain separate frontend and backend applications.

This separation makes the project easier to develop, test, debug, and maintain.

The frontend focuses on the user interface, while the backend focuses on business logic and data processing.

The frontend communicates with the backend through HTTP API requests.

### Basic Architecture

```text
          USER
            |
            v
    NEXT.JS FRONTEND
    (TypeScript + Tailwind)
            |
            | HTTP API Requests
            v
      FASTAPI BACKEND
          (Python)
            |
            v
     BUSINESS LOGIC
            |
            v
         DATABASE
```

This is the high-level architecture of the application. Individual modules explain the database integration and business logic in detail.

## 1.7 Why Did We Separate Frontend and Backend?

We separated the frontend and backend for several reasons:

**1. Better Code Organization**

Frontend and backend code are maintained independently. This keeps responsibilities clear.

**2. Easy Maintenance**

Changes in the user interface do not require rewriting backend business logic.

**3. Independent Development**

Frontend and backend development can happen independently as long as their API contracts remain consistent.

**4. Scalability**

The frontend and backend can be deployed and scaled independently when required.

**5. AI Integration**

Using Python and FastAPI makes it easier to integrate AI and machine learning libraries and services into the backend.

## 1.8 Git and GitHub Integration

We use Git for version control and GitHub to host the project repository.

Git helps us track changes in the source code.

GitHub provides a central place to maintain the project and its development history.

We follow meaningful commit messages to describe individual development tasks.

Examples:

- `chore: initialize Next.js and FastAPI project structure`
- `feat: implement JWT authentication`
- `feat: implement customer management APIs`

We also keep sensitive configuration values, such as API keys, outside committed example files.

## 1.9 Benefits of the Initial Architecture

The initial project setup provides several benefits:

- Clear separation between frontend and backend.
- Easier development and debugging.
- Better code organization.
- Support for future AI and machine learning features.
- Independent frontend and backend deployment.
- Easier collaboration and version control.
- A foundation for adding new application modules.

## 1.10 Final Summary

In this module, we established the foundation of Universal Digital Khata.

We selected Next.js, TypeScript, and Tailwind CSS for the frontend and Python with FastAPI for the backend.

We also separated the frontend and backend responsibilities and integrated Git and GitHub for version control.

This initial setup created the foundation on which we developed the database, authentication, customer management, transaction management, AI features, and other application modules.

**The main objective of this module was to create a clean, maintainable, and scalable foundation for the complete application.**

# 2. Neon PostgreSQL Database Integration

## 2.1 Introduction

Every application needs a database to store and manage its information.

Universal Digital Khata needs to store important business information, such as:

- Shop owner details
- Shop information
- Customer records
- Credit and payment transactions
- Transaction history
- Other application-related information

For this purpose, we integrated PostgreSQL as our primary relational database.

We selected Neon as our PostgreSQL database hosting platform and SQLAlchemy as the database toolkit for communicating with the database from our FastAPI backend.

We also configured asynchronous database connectivity to support non-blocking database operations.

## 2.2 What is PostgreSQL?

PostgreSQL is an open-source relational database management system (RDBMS).

It stores information in tables containing rows and columns.

For example, a customer table may contain:

| ID | Customer Name | Mobile Number |
|---|---|---|
| 1 | Rahul | 9876543210 |
| 2 | Amit | 9876543211 |
| 3 | Priya | 9876543212 |

Each row represents one customer, while each column represents a specific piece of information.

PostgreSQL also supports relationships between tables, constraints, transactions, indexing, and complex queries.

These features make it suitable for applications that manage structured business information.

## 2.3 What is Neon?

Neon is a cloud platform that provides managed PostgreSQL databases.

Instead of installing and maintaining a PostgreSQL database server on our own computer or managing database infrastructure manually, we can create and use a hosted PostgreSQL database through Neon.

### Why Did We Choose Neon?

We selected Neon for the following reasons:

1. **Managed PostgreSQL:** We can use PostgreSQL without managing the database server ourselves.

2. **Cloud Database:** Our application backend can connect to the database over the internet.

3. **Developer Friendly:** Neon provides database connection details that can be configured in our backend.

4. **Scalability:** Neon provides features that support changing database requirements as an application grows.

5. **PostgreSQL Compatibility:** We can use standard PostgreSQL features and tools.

## 2.4 What is SQLAlchemy?

SQLAlchemy is a Python SQL toolkit and Object Relational Mapper (ORM).

It helps Python applications communicate with relational databases.

Without an ORM, developers often write SQL queries manually for database operations.

SQLAlchemy provides an alternative approach where Python classes can represent database tables and objects can represent database records.

For example, a Python customer object can represent a customer record in the database.

SQLAlchemy supports both SQL-based operations and ORM-based operations.

### Why Did We Use SQLAlchemy?

We used SQLAlchemy because:

- It integrates with Python applications.
- It supports PostgreSQL.
- It provides ORM capabilities.
- It helps organize database operations.
- It supports asynchronous database operations.
- It makes database code easier to maintain.

## 2.5 What is Async SQLAlchemy?

SQLAlchemy supports both synchronous and asynchronous database operations.

In synchronous execution, a database operation generally blocks the current thread until the operation finishes.

In asynchronous execution, the application can await a database operation and allow the event loop to process other available tasks while waiting for the database response.

We selected asynchronous SQLAlchemy because our backend is built using FastAPI and we wanted asynchronous database communication.

We configured the SQLAlchemy asynchronous engine and used AsyncSession for database operations.

### Important Components

**1. create_async_engine()**

This function creates an asynchronous SQLAlchemy engine.

The engine manages database connectivity and provides the foundation for executing database operations.

**2. AsyncSession**

AsyncSession is used to interact with the database asynchronously.

It helps perform operations such as:

- Adding records
- Reading records
- Updating records
- Deleting records
- Committing transactions
- Rolling back failed transactions

**3. asyncpg**

We used asyncpg as the asynchronous PostgreSQL database driver.

It allows the Python application to communicate with PostgreSQL using asynchronous operations.

## 2.6 Database Connection Architecture

The basic database communication flow is:

```text
       USER REQUEST
             |
             v
      NEXT.JS FRONTEND
             |
             v
       FASTAPI BACKEND
             |
             v
      SQLALCHEMY ASYNC
             |
             v
        ASYNCPG DRIVER
             |
             v
      NEON POSTGRESQL
             |
             v
      DATABASE RESPONSE
             |
             v
       FASTAPI BACKEND
             |
             v
      FRONTEND RESPONSE
```

The frontend sends a request to FastAPI.

The backend processes the request and communicates with Neon PostgreSQL through SQLAlchemy and the asyncpg driver.

After the database operation completes, the backend returns the appropriate response.

## 2.7 Database Configuration

We configured the database connection through environment-based configuration.

The database connection string contains the information required to connect to the PostgreSQL database.

Sensitive connection details should not be written directly inside application source code.

Instead, they should be stored in environment variables.

For example:

```env
DATABASE_URL=your_neon_postgresql_connection_string
```

The example above is a placeholder. The actual connection string must be obtained from the Neon dashboard.

### Why Use Environment Variables?

- They keep sensitive database credentials out of source code.
- They make it easier to use different configurations for development and production.
- They reduce the risk of accidentally publishing database credentials on GitHub.
- They make deployment configuration easier.

The actual `.env` file should not be committed to the GitHub repository.

## 2.8 Asynchronous Database Session Management

A database session represents a unit of interaction between the application and the database.

We use asynchronous sessions to perform database operations.

A session should be managed carefully so that database connections and resources are properly released.

The general workflow is:

1. Create or obtain an asynchronous database session.
2. Execute database operations.
3. Commit changes when required.
4. Roll back changes if an operation fails.
5. Close or release the session after use.

This helps maintain reliable database communication.

## 2.9 Why Did We Choose Asynchronous Database Operations?

Our backend uses FastAPI, which supports asynchronous request handling.

Database operations may take time because they involve communication with an external database server.

Using asynchronous database operations helps the application avoid blocking the event loop while waiting for database responses.

This is useful when multiple users send requests to the backend.

However, asynchronous programming does not automatically make every database query faster. Proper query design, connection management, and database optimization are also important.

## 2.10 Database Connection Testing

After configuring Neon PostgreSQL, we needed to verify that the backend could establish a connection successfully.

We used a database health-check endpoint to test database connectivity.

The purpose of this endpoint is to check whether the backend can communicate with the configured database.

A successful database health check indicates that the application can establish the required database connection.

It does not necessarily prove that every database operation or application feature is working correctly.

## 2.11 Problems Faced During Database Integration

During development, we encountered database connection-related errors while testing the asynchronous database setup.

One of the errors occurred when the backend attempted to connect to Neon PostgreSQL through SQLAlchemy's asynchronous engine.

We investigated the database connection and asynchronous execution configuration.

This helped us understand the importance of:

- Correct database connection strings.
- Proper asynchronous database drivers.
- Correct SQLAlchemy engine configuration.
- Proper session management.
- Database connectivity testing.

These checks are important because even a correctly written API cannot perform database operations if the database connection is not configured properly.

## 2.12 Benefits of This Integration

By integrating Neon PostgreSQL with SQLAlchemy, we established the database foundation for Universal Digital Khata.

The main benefits are:

1. Structured storage of business information.
2. Reliable relational database support.
3. Cloud-based database access.
4. Asynchronous database communication.
5. Organized database operations through SQLAlchemy.
6. Easier integration with FastAPI.
7. A foundation for customer, shop, and transaction management.

## 2.13 Final Summary

In this module, we integrated Neon PostgreSQL with our FastAPI backend.

We used SQLAlchemy as the database toolkit and configured asynchronous database communication using AsyncSession and the asyncpg driver.

We also configured environment-based database connection settings and tested database connectivity through a health-check endpoint.

This integration established the database foundation required for the remaining modules of Universal Digital Khata.

**The main objective of this module was to establish reliable, asynchronous communication between our FastAPI backend and the hosted PostgreSQL database.**


# 3. Database Models and Migrations

## 3.1 Introduction

After integrating Neon PostgreSQL with our FastAPI backend, the next step was to design the database structure.

Our application needs to store different types of information, such as shop details, customer records, transactions, and user information.

Instead of storing everything in a single table, we organized the data into separate database tables.

For this purpose, we implemented database models using SQLAlchemy ORM and managed database schema changes using Alembic migrations.

## 3.2 What Are Database Models?

A database model is a Python class that represents a database table.

In SQLAlchemy ORM, we define classes and their attributes. These attributes represent the columns of the corresponding database table.

For example, a Customer model can represent a customer table.

A simplified example:

```python
class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    mobile = Column(String)
```

In this example:

- Customer is the Python model.
- customers is the database table.
- id, name, and mobile represent database columns.

This is a simplified illustration of an ORM model, not the complete project implementation.

## 3.3 Why Did We Create Separate Models?

We created separate models to organize application data properly.

For example:

- User information belongs to the user-related model.
- Shop information belongs to the shop-related model.
- Customer information belongs to the customer-related model.
- Transaction information belongs to the transaction-related model.

This separation provides better organization and makes relationships between different types of data easier to manage.

## 3.4 What Is SQLAlchemy ORM?

ORM stands for Object Relational Mapping.

It allows developers to work with relational database records through Python objects.

Without an ORM, developers often write SQL queries manually.

With SQLAlchemy ORM, we can define Python classes and use them to perform database operations.

For example, we can create a customer object and add it to a database session.

SQLAlchemy manages the conversion between Python objects and database operations.

## 3.5 What Are Database Relationships?

In a digital ledger application, different records are connected to each other.

For example:

- A shop has customers.
- A customer can have multiple transactions.
- A transaction belongs to a particular customer.
- User and shop records are associated according to the application's ownership design.

These connections are represented using database relationships.

Common relational database concepts include:

**Primary Key:** A column that uniquely identifies a record in a table.

**Foreign Key:** A column that references a record in another table.

**One-to-Many Relationship:** One record can be associated with multiple records in another table.

These concepts help maintain the relationships between application data.

## 3.6 What Is Alembic?

Alembic is a database migration tool commonly used with SQLAlchemy.

Whenever we change the database structure, such as adding a new column or creating a new table, we need a controlled way to apply that change to the database.

Alembic helps manage these database structure changes through migration files.

A migration file describes the changes that should be applied to the database.

## 3.7 Why Did We Use Alembic?

We used Alembic because:

1. It integrates with SQLAlchemy.
2. It manages database schema changes.
3. It keeps track of migration versions.
4. It helps maintain database consistency across environments.
5. It reduces the need to manually modify database tables.
6. It provides a structured migration history.

## 3.8 How Do Database Migrations Work?

The general migration workflow is:

1. Define or update SQLAlchemy models.
2. Generate a migration revision.
3. Review the generated migration file.
4. Apply the migration to the database.
5. Verify that the database structure has been updated.

Example commands:

```bash
alembic revision --autogenerate -m "create database tables"
alembic upgrade head
```

The first command generates a migration revision based on model changes and database metadata.

The second command applies pending migrations up to the latest revision.

Generated migrations should always be reviewed before applying them.

## 3.9 What Is the Purpose of a Migration Version?

Alembic maintains a migration history.

Each migration has a revision identifier.

This helps Alembic identify which database changes have already been applied and which changes are still pending.

It also helps developers manage database changes in a controlled order.

## 3.10 Benefits of Database Models and Migrations

- Organized database structure.
- Better separation of application data.
- Easier database operations through ORM.
- Proper relationships between records.
- Controlled database schema updates.
- Easier development and maintenance.
- Better consistency between development and production environments.

## 3.11 Final Summary

In this module, we implemented database models using SQLAlchemy ORM and managed database schema changes using Alembic.

We organized the application data into separate models and established the foundation for relationships between users, shops, customers, and transactions.

Alembic provided a structured way to track and apply database schema changes.

**The main objective was to create an organized, maintainable, and version-controlled database structure for Universal Digital Khata.**


# 4. JWT Authentication and Authorization

## 4.1 Introduction

Universal Digital Khata is designed for shop owners who need to manage their business records digitally.

Since the application stores private business information, we needed a secure authentication system.

For this purpose, we implemented JWT-based authentication and user authorization in our FastAPI backend.

This module allows users to authenticate themselves and access protected application resources according to their permissions.

## 4.2 What Is Authentication?

Authentication is the process of verifying the identity of a user.

For example, when a shop owner enters their email and password, the application checks whether the provided credentials are valid.

If the credentials are correct, the application allows the user to access their account.

If the credentials are incorrect, authentication fails.

In simple words:

**Authentication answers the question: Who are you?**

## 4.3 What Is Authorization?

Authorization determines what an authenticated user is allowed to access or perform.

For example, a shop owner should only be allowed to access the business information associated with their account.

The application must not allow one user to access another user's private customer or transaction records.

In simple words:

**Authorization answers the question: What are you allowed to access?**

## 4.4 What Is JWT?

JWT stands for JSON Web Token.

It is a compact token format used to securely transmit information between parties.

In web applications, JWTs are commonly used to represent an authenticated user's identity and relevant claims.

A JWT generally contains three parts:

1. Header
2. Payload
3. Signature

### Header

The header contains information about the token type and signing algorithm.

### Payload

The payload contains claims, such as the user's identity and token expiration time.

### Signature

The signature helps verify that the token has not been modified after it was issued.

A JWT is encoded, not automatically encrypted. Sensitive information such as passwords or API keys should never be stored inside its payload.

## 4.5 Why Did We Choose JWT Authentication?

We selected JWT-based authentication because:

- It supports token-based authentication.
- It works well with REST APIs.
- The backend can validate tokens on protected requests.
- It allows the frontend and backend to communicate independently.
- It supports token expiration.
- It can carry user identity information through claims.

## 4.6 Authentication Workflow

The general authentication workflow is:

1. The user submits login credentials.
2. The frontend sends the credentials to the backend.
3. FastAPI receives the login request.
4. The backend verifies the user's credentials.
5. If the credentials are valid, the backend generates an authentication token.
6. The frontend receives the authentication response.
7. The frontend uses the token when accessing protected APIs.
8. The backend validates the token before allowing access to protected resources.

### Architecture Flow

```text
        USER
          |
          v
     LOGIN FORM
          |
          v
     FASTAPI API
          |
          v
   VERIFY CREDENTIALS
          |
          v
    GENERATE JWT
          |
          v
   RETURN AUTH TOKEN
          |
          v
  PROTECTED API REQUEST
          |
          v
    VALIDATE JWT
          |
          v
   ALLOW OR DENY ACCESS
```

## 4.7 What Happens When a Protected API Is Called?

When a user accesses a protected API, the frontend includes the authentication token in the request.

The backend performs the required token validation.

The backend checks whether:

- The token is valid.
- The signature is correct.
- The token has not expired.
- The required user identity information is available.

If validation succeeds, the request can continue.

If validation fails, the backend rejects the request.

## 4.8 Password Security

Passwords should never be stored as plain text in a database.

A secure authentication system stores password hashes instead of original passwords.

When a user logs in, the backend verifies the submitted password against the stored password hash.

Password hashing is different from encryption because password hashes are designed to be verified rather than decrypted.

## 4.9 User Authorization and Data Protection

Authentication alone is not enough to protect business data.

The backend must also verify that the authenticated user has permission to access the requested resource.

For example:

- User A should not access User B's customer records.
- User A should not modify User B's transactions.
- A shop owner should access only the shop resources permitted by the application's ownership rules.

This is important because hiding information in the frontend does not provide actual backend security.

The backend must enforce authorization checks on protected operations.

## 4.10 Benefits of JWT Authentication

1. Secure user authentication.
2. Token-based API access.
3. Protected backend endpoints.
4. User identity verification.
5. Support for token expiration.
6. Separation of authentication and business logic.
7. Better protection of private business information.

## 4.11 Important Security Considerations

A production authentication system should also consider:

- Secure password hashing.
- Appropriate token expiration.
- Safe token storage.
- HTTPS communication.
- Secret key protection.
- Token validation on protected endpoints.
- Authorization checks for every sensitive resource.
- Appropriate handling of expired and invalid tokens.

The JWT signing secret must be stored in environment variables and must never be committed to GitHub.

## 4.12 Final Summary

In this module, we implemented JWT-based authentication and user authorization in our FastAPI backend.

The authentication system verifies user identity and provides an authentication token for accessing protected APIs.

Authorization ensures that users can access only the resources permitted for their accounts.

This module provides an important security foundation for managing private shop, customer, and transaction information.

**The main objective was to protect the application and ensure that users can access their permitted business data securely.**



# 5. Shop Management APIs

## 5.1 Introduction

Universal Digital Khata is designed to support shop owners in managing their daily business credit records.

A shop is the main business entity in our application.

Before managing customers and transactions, the application needs to maintain the shop information associated with the authenticated user.

For this purpose, we implemented Shop Management APIs using FastAPI.

These APIs allow the application to manage shop-related information through backend endpoints.

## 5.2 Why Did We Need Shop Management?

Every business has its own identity and information.

For example, a shop may have:

- Shop name
- Business category
- Contact information
- Address
- Owner information

The application needs to store this information so that it can associate customers and transactions with the correct business.

Without shop management, it would become difficult to organize business data properly.

## 5.3 What Are Shop Management APIs?

Shop Management APIs are backend endpoints responsible for handling shop-related operations.

The frontend communicates with these APIs through HTTP requests.

The backend receives the request, performs validation and business logic, interacts with the database, and returns an appropriate response.

These APIs act as the communication layer between the frontend and the shop-related database operations.

## 5.4 Why Did We Use FastAPI?

We used FastAPI to implement the shop management endpoints because:

1. It supports REST API development.
2. It provides request and response validation.
3. It integrates with Python and SQLAlchemy.
4. It supports asynchronous request handling.
5. It provides automatic API documentation.
6. It allows us to organize backend functionality into separate routes.

## 5.5 Main Responsibilities of Shop Management

The Shop Management module is responsible for:

- Managing shop-related information.
- Associating shop records with the correct user.
- Validating incoming shop data.
- Storing shop information in PostgreSQL.
- Retrieving shop information when required.
- Updating shop details.
- Protecting shop resources through authentication and authorization.

The exact operations available depend on the implemented API endpoints.

## 5.6 Shop Creation Workflow

When a user creates a shop, the general workflow is:

1. The user enters the required shop information in the frontend.
2. The frontend sends the information to the backend.
3. FastAPI receives the request.
4. The backend validates the incoming data.
5. The backend identifies the authenticated user.
6. The shop information is processed and stored in PostgreSQL.
7. The backend returns the operation result.
8. The frontend displays the appropriate response.

### Architecture Flow

```text
       SHOP CREATION FORM
                |
                v
          NEXT.JS FRONTEND
                |
                v
         FASTAPI ENDPOINT
                |
                v
         REQUEST VALIDATION
                |
                v
       AUTHENTICATED USER CHECK
                |
                v
        SHOP BUSINESS LOGIC
                |
                v
         SQLALCHEMY ORM
                |
                v
         NEON POSTGRESQL
                |
                v
          API RESPONSE
```

## 5.7 Shop Data Validation

Data validation is important because incorrect information can create problems in the database and other application modules.

For example:

- A required shop name should not be missing.
- Contact information should follow the expected format.
- Business information should be valid.
- The application should reject invalid requests.

FastAPI supports request validation through its integration with Pydantic.

This helps the backend validate incoming data before processing it.

## 5.8 Relationship Between User and Shop

A shop needs to be associated with the correct user.

This relationship is important for maintaining ownership of business information.

For example, when a shop owner logs in, the backend should identify the shop associated with that authenticated user.

This also helps other modules identify which shop's customers and transactions should be accessed.

The database relationship and authorization checks work together to protect shop information.

## 5.9 Shop Management and Other Modules

Shop Management acts as an important foundation for other application features.

### Customer Management

Customer records need to be associated with the appropriate shop.

### Transaction Management

Transactions need to be organized under the correct business and customer records.

### Dashboard Analytics

Dashboard information should represent the business data belonging to the relevant shop.

### AI Credit Risk Analysis

AI-based analysis requires access to the appropriate customer and transaction information.

Therefore, shop management helps organize the business data used by the remaining application modules.

## 5.10 Why Did We Keep Shop Management Separate?

We separated shop management from customer and transaction management because each module has a different responsibility.

Shop Management handles business information.

Customer Management handles customer records.

Transaction Management handles credit and payment records.

This separation provides:

- Better code organization.
- Easier debugging.
- Independent API development.
- Easier testing.
- Better maintainability.
- Clear separation of responsibilities.

## 5.11 Benefits of Shop Management APIs

1. Centralized management of shop information.
2. Association between users and their shops.
3. Better organization of business data.
4. Foundation for customer management.
5. Foundation for transaction management.
6. Support for dashboard and reporting features.
7. Better separation of backend responsibilities.

## 5.12 Final Summary

In this module, we implemented Shop Management APIs using FastAPI.

These APIs provide the backend functionality required to manage shop-related information and associate it with the authenticated user.

We also established the shop management foundation required by customer management, transaction management, dashboard analytics, and AI-related modules.

**The main objective was to create a centralized way to manage shop information and organize all business-related data under the correct shop.**


# 6. Customer Management APIs

## 6.1 Introduction

Customer Management is one of the core modules of Universal Digital Khata.

In traditional shops, shopkeepers maintain customer details and credit records in physical notebooks. Managing these records manually can become difficult when the number of customers increases.

To solve this problem, we implemented Customer Management APIs using FastAPI.

These APIs allow the application to manage customer-related information digitally and associate customer records with the appropriate shop.

## 6.2 Why Did We Need Customer Management?

A shopkeeper needs to maintain customer information to manage credit transactions.

For example, a customer may purchase products worth ₹500 and decide to pay later.

The shopkeeper needs to maintain the customer's details so that the transaction can be recorded against the correct person.

Customer Management provides the foundation for maintaining these records.

## 6.3 Main Responsibilities

The Customer Management module handles:

- Managing customer information.
- Associating customers with the appropriate shop.
- Validating customer-related requests.
- Retrieving customer records.
- Updating customer information.
- Supporting customer-related operations used by other modules.

## 6.4 How Does It Work?

The frontend communicates with the Customer Management APIs through HTTP requests.

The general workflow is:

1. The shopkeeper opens the customer section.
2. The frontend sends a request to FastAPI.
3. FastAPI validates the request.
4. The backend checks the authenticated user's access.
5. The customer-related business logic is executed.
6. SQLAlchemy interacts with PostgreSQL.
7. The backend returns the API response.
8. The frontend displays the result.

## 6.5 Customer Creation Workflow

When a shopkeeper adds a new customer:

```text
      CUSTOMER FORM
            |
            v
      NEXT.JS FRONTEND
            |
            v
       FASTAPI API
            |
            v
     REQUEST VALIDATION
            |
            v
   AUTHORIZATION CHECK
            |
            v
    CUSTOMER BUSINESS LOGIC
            |
            v
      SQLALCHEMY ORM
            |
            v
    NEON POSTGRESQL
            |
            v
       API RESPONSE
```

This flow explains how customer information moves from the frontend to the database.

## 6.6 Customer and Shop Relationship

Customer records need to be associated with the correct shop.

For example, if Shop A creates a customer, that customer should belong to Shop A rather than another shop.

This relationship helps maintain proper data organization and supports access control.

It also allows the transaction module to identify the correct customer when recording a credit or payment transaction.

## 6.7 Customer Validation

Customer information should be validated before it is stored.

Validation helps prevent incomplete or invalid records.

For example, the backend may validate:

- Required customer information.
- Valid input formats.
- Shop ownership.
- Customer existence when performing customer-related operations.

FastAPI and Pydantic help validate incoming API data.

## 6.8 Integration with Other Modules

Customer Management is connected to several other modules.

**Transaction Management:** Transactions are associated with customers.

**Dashboard Analytics:** Customer records help generate customer-related business information.

**AI Credit Risk Analysis:** Customer transaction history can be used for credit risk insights.

**Notifications:** Customer contact information can support payment reminders and updates.

## 6.9 Benefits

- Digital customer record management.
- Better organization of customer information.
- Association between customers and shops.
- Foundation for credit transaction tracking.
- Easier integration with analytics and AI features.
- Reduced dependency on physical notebooks.

## 6.10 Final Summary

In this module, we implemented Customer Management APIs using FastAPI.

These APIs provide backend functionality for managing customer information and connecting customer records with the appropriate shop.

This module is an important foundation for transaction management, dashboard analytics, AI-based credit insights, and customer notifications.

**The main objective was to provide shopkeepers with a structured digital system for managing their customers.**


# 7. Transaction Management and Notifications

## 7.1 Introduction

Transaction Management is one of the most important modules of Universal Digital Khata.

In traditional businesses, shopkeepers often record customer credit and payment details in physical notebooks.

This process can become difficult when there are many customers and daily transactions.

To solve this problem, we implemented Transaction Management APIs using FastAPI.

This module provides backend functionality for managing customer-related financial transactions.

## 7.2 What Is Transaction Management?

Transaction Management is the process of recording and maintaining financial activities associated with customers.

In a digital ledger application, two important transaction types are:

**Credit Transaction:** When a customer purchases something but does not pay immediately, the amount is recorded as credit.

**Payment Transaction:** When a customer pays an outstanding amount, the payment is recorded.

These records help the shopkeeper maintain customer account information.

## 7.3 Why Did We Need This Module?

We needed a centralized system to:

- Record customer credit.
- Record customer payments.
- Maintain transaction history.
- Track outstanding balances.
- Associate transactions with the correct customer and shop.
- Support customer notifications.

Without a transaction management system, shopkeepers would need to maintain these records manually.

## 7.4 Transaction Creation Workflow

The general transaction workflow is:

1. The shopkeeper selects a customer.
2. The shopkeeper enters transaction information.
3. The frontend sends the request to FastAPI.
4. The backend validates the request.
5. The backend verifies the relevant customer and shop association.
6. Transaction business logic is executed.
7. SQLAlchemy stores the transaction in PostgreSQL.
8. The backend returns the result.
9. The frontend updates the transaction information.

### Architecture Flow

```text
       TRANSACTION FORM
              |
              v
        NEXT.JS FRONTEND
              |
              v
          FASTAPI API
              |
              v
       REQUEST VALIDATION
              |
              v
     CUSTOMER / SHOP CHECK
              |
              v
     TRANSACTION PROCESSING
              |
              v
         SQLALCHEMY
              |
              v
      NEON POSTGRESQL
              |
              v
         API RESPONSE
```

## 7.5 Credit and Payment Records

A credit transaction increases the amount a customer owes.

A payment transaction records money received from the customer and reduces the outstanding amount according to the application's accounting rules.

For example:

- Customer purchases goods worth ₹1,000 on credit.
- Customer later pays ₹400.
- The remaining outstanding amount is ₹600.

This is a simplified example to explain the concept.

## 7.6 Transaction History

Transaction history helps shopkeepers review previous financial activities.

It provides a record of customer credit and payment entries.

This information is useful for:

- Reviewing customer accounts.
- Understanding previous transactions.
- Tracking outstanding balances.
- Supporting business reports.
- Providing data for AI-based analysis.

## 7.7 What Is Transaction Idempotency?

Transaction idempotency is an important concept in reliable API development.

Sometimes a user may submit a request more than once because of:

- Slow internet.
- Network interruption.
- Accidental repeated clicks.
- Automatic request retries.

If the same transaction is processed multiple times, it may create duplicate financial records.

To reduce this risk, we implemented transaction idempotency support.

An idempotency key helps the backend identify repeated submissions of the same logical request.

For example:

```text
First request:
Idempotency Key = TXN-123

Repeated request:
Idempotency Key = TXN-123
```

The backend can use this key to recognize that the request has already been processed instead of creating another transaction.

The exact duplicate-handling behavior depends on the backend implementation.

## 7.8 FIFO Repayment Allocation

FIFO stands for First In, First Out.

In credit management, FIFO repayment allocation means applying a customer's payment to the oldest outstanding credit first.

Example:

| Credit entry | Amount |
|---|---:|
| First credit | ₹500 |
| Second credit | ₹300 |
| Third credit | ₹200 |

Suppose the customer pays ₹600.

Under FIFO allocation:

- ₹500 is allocated to the first credit.
- ₹100 is allocated to the second credit.
- ₹200 remains outstanding on the second credit.
- The third credit remains outstanding at ₹200.

This approach provides a structured way to allocate repayments against older dues first.

## 7.9 Customer Notifications

Notifications help improve communication between shopkeepers and customers.

The application includes customer notification and payment reminder functionality.

Notifications can help customers stay informed about their outstanding payments.

A typical reminder workflow is:

1. The shopkeeper selects a customer or reminder action.
2. The backend processes the reminder request.
3. The notification functionality handles the communication.
4. The customer receives the reminder through the configured notification channel, if successfully delivered.

The exact notification provider and delivery mechanism depend on the configured implementation.

## 7.10 Benefits

- Digital credit and payment records.
- Organized transaction history.
- Better tracking of outstanding amounts.
- Reduced risk of duplicate transaction submissions.
- Structured repayment allocation using FIFO.
- Support for customer payment reminders.
- Foundation for AI-based financial analysis.

## 7.11 Final Summary

In this module, we implemented Transaction Management APIs to manage customer credit and payment records.

We also introduced transaction idempotency support to reduce duplicate transaction processing and FIFO repayment allocation to handle payments against older outstanding credits.

Customer notification functionality supports payment reminders and communication.

**The main objective was to make customer credit and payment tracking more organized, reliable, and convenient for shopkeepers.**


# 8. Dashboard Analytics and Summary APIs

## 8.1 Introduction

A shopkeeper needs more than just customer and transaction records.

They also need to understand the overall financial condition of their business.

For example:

- How much money is currently outstanding?
- How much payment has been received?
- How many customers are registered?
- What is the overall credit position of the shop?

To provide this information in one place, we implemented Dashboard Analytics and Summary APIs using FastAPI.

These APIs provide summarized business information to the frontend dashboard.

## 8.2 What Is Dashboard Analytics?

Dashboard Analytics is the process of converting raw application records into meaningful summary information.

Instead of checking every customer and transaction individually, the shopkeeper can view important business information in a centralized dashboard.

The backend retrieves and processes relevant database information and returns summary data through APIs.

## 8.3 Why Did We Need Dashboard APIs?

We needed dashboard APIs because shopkeepers require a quick overview of their business activities.

A centralized dashboard helps users:

- Understand outstanding customer credit.
- Review payment-related information.
- View customer-related summaries.
- Monitor business activity.
- Make better business decisions.

## 8.4 How Does Dashboard Analytics Work?

The frontend requests dashboard information from the FastAPI backend.

The backend retrieves the required records from PostgreSQL and performs the necessary calculations.

The summarized information is then returned to the frontend.

### Architecture Flow

```text
        SHOPKEEPER
             |
             v
       NEXT.JS DASHBOARD
             |
             v
        FASTAPI API
             |
             v
      DATABASE QUERIES
             |
             v
     NEON POSTGRESQL
             |
             v
    DATA AGGREGATION
             |
             v
      SUMMARY RESPONSE
             |
             v
      DASHBOARD DISPLAY
```

## 8.5 What Is Data Aggregation?

Data aggregation means combining multiple records to calculate meaningful summary values.

For example, suppose a shop has three outstanding customer balances:

| Customer | Outstanding amount |
|---|---:|
| Customer A | ₹500 |
| Customer B | ₹300 |
| Customer C | ₹200 |

The total outstanding amount is:

\[
500 + 300 + 200 = 1000
\]

Therefore, the total outstanding credit is ₹1,000.

This is a simple example of aggregation.

Database aggregation functions such as SUM and COUNT can be used to calculate summary information.

## 8.6 Examples of Dashboard Metrics

Depending on the implemented API response, a shop dashboard can display metrics such as:

**Total Outstanding Credit:** The total amount customers currently owe.

**Total Payments:** The total recorded payment amount for the selected period or scope.

**Total Customers:** The number of customer records associated with the shop.

**Transaction Summary:** A summarized view of transaction activity.

These are examples of useful dashboard metrics; the exact fields depend on the actual API response.

## 8.7 Backend Responsibilities

The backend is responsible for:

1. Receiving dashboard requests.
2. Validating the authenticated user's access.
3. Identifying the relevant shop.
4. Retrieving required database records.
5. Performing summary calculations.
6. Returning structured API responses.

This keeps the main data-processing logic on the backend instead of relying entirely on frontend calculations.

## 8.8 Why Did We Use Summary APIs?

We used summary APIs to separate dashboard data processing from frontend presentation.

The frontend does not need to retrieve every individual record just to display a summary.

Instead, it can request the required summarized information from the backend.

This approach can reduce unnecessary data transfer and keep business calculations consistent.

## 8.9 Integration with Other Modules

Dashboard Analytics depends on information from other application modules.

**Shop Management:** Identifies the relevant business.

**Customer Management:** Provides customer-related information.

**Transaction Management:** Provides credit and payment records.

**AI Credit Risk Analysis:** Can provide additional insights that help shopkeepers understand customer payment behavior.

Therefore, dashboard analytics brings information from different modules into one useful view.

## 8.10 Benefits

- Centralized business overview.
- Quick access to important metrics.
- Better understanding of outstanding credit.
- Reduced need to manually calculate totals.
- Structured backend data processing.
- Better decision-making support.
- Easier integration with future analytics features.

## 8.11 Final Summary

In this module, we implemented Dashboard Analytics and Summary APIs using FastAPI.

These APIs retrieve relevant business information, process records, and provide summarized data to the frontend dashboard.

This helps shopkeepers understand their business activity without manually reviewing every customer and transaction record.

**The main objective was to convert application records into useful business summaries and provide a centralized dashboard experience.**

# 9. AI-Based Credit Risk Analysis

## 9.1 Introduction

One of the important features of Universal Digital Khata is AI-based credit risk analysis.

In a traditional shop, shopkeepers often give products to customers on credit. However, it can be difficult to understand which customers regularly repay their dues and which customers have delayed payments.

To make this process easier, we implemented an AI-based credit risk analysis feature.

The purpose of this feature is to analyze customer-related financial information and provide useful insights that help shopkeepers understand customer payment behavior.

## 9.2 What Is Credit Risk Analysis?

Credit risk analysis is the process of evaluating the possibility that a customer may not repay an outstanding amount on time.

For example:

- Customer A regularly pays on time.
- Customer B sometimes delays payments.
- Customer C has a large outstanding balance and a history of delayed payments.

These customers may have different credit risk levels.

Credit risk analysis helps shopkeepers understand these differences before making further credit decisions.

## 9.3 Why Did We Add AI to Digital Khata?

A normal digital ledger stores customer transactions, but it does not necessarily provide intelligent insights about customer payment behavior.

We wanted to make the application more useful by analyzing existing customer and transaction information.

The AI-based feature can help shopkeepers:

- Understand customer payment patterns.
- Identify customers who may require attention.
- Review outstanding credit information.
- Make more informed credit decisions.
- Reduce the effort required for manual analysis.

## 9.4 How Does It Work?

The general workflow is:

1. The shopkeeper selects a customer or opens the credit risk section.
2. The frontend requests the relevant information from the backend.
3. The backend retrieves the required customer and transaction information.
4. The credit risk analysis logic processes the available information.
5. The backend prepares the analysis result.
6. The frontend displays the resulting insights.

### Architecture Flow

```text
       CUSTOMER DATA
             |
             v
      TRANSACTION HISTORY
             |
             v
        FASTAPI BACKEND
             |
             v
      CREDIT RISK ANALYSIS
             |
             v
       ANALYSIS RESULT
             |
             v
       NEXT.JS FRONTEND
             |
             v
       SHOPKEEPER VIEW
```

## 9.5 What Information Can Be Useful?

Credit risk analysis can use information such as:

- Outstanding credit amount.
- Previous credit transactions.
- Payment history.
- Repayment behavior.
- Delayed payment patterns.

The exact inputs and calculation method depend on the implemented analysis logic.

## 9.6 Understanding Credit Risk Levels

A credit risk system may categorize customers into different levels.

For example:

**Low Risk:** Customers who generally maintain good repayment behavior.

**Medium Risk:** Customers whose repayment behavior requires some attention.

**High Risk:** Customers who may have significant outstanding amounts or repeated repayment delays.

These categories are useful for presenting analysis in a simple way.

The actual classification criteria must be based on the project's implemented logic.

## 9.7 How Does It Help Shopkeepers?

Suppose a shopkeeper has 100 customers.

Checking every customer's transaction history manually can take a lot of time.

An analysis feature can help highlight customers whose payment behavior deserves attention.

The shopkeeper can then review those records and make an informed decision about providing additional credit.

AI-based analysis should support the shopkeeper's decision, not automatically determine whether a customer deserves credit.

## 9.8 Benefits

- Better understanding of customer repayment behavior.
- Easier identification of customers requiring attention.
- Reduced manual analysis.
- More informed credit decisions.
- Better use of existing transaction data.
- Additional intelligence beyond basic ledger functionality.

## 9.9 Final Summary

In this module, we implemented AI-based credit risk analysis for Universal Digital Khata.

The feature uses customer-related financial information to provide insights into repayment behavior and outstanding credit.

It helps shopkeepers understand their customers' credit patterns and make more informed business decisions.

**The main objective was to transform ordinary transaction records into useful credit-related insights.**


# 10. AI Voice Transaction Entry

## 10.1 Introduction

One of the main goals of Universal Digital Khata is to make digital ledger management simple for shopkeepers.

Many shopkeepers are comfortable speaking but may not prefer typing transaction details into an application.

To improve the user experience, we implemented AI-powered voice transaction entry.

This feature allows users to describe a transaction using their voice instead of manually entering every detail.

For example, a shopkeeper can say:

"Rahul ko 500 rupaye udhar diye."

The application can process the spoken instruction and extract the relevant transaction information.

## 10.2 Why Did We Need Voice-Based Transaction Entry?

Traditional digital ledger applications often require users to:

1. Open the application.
2. Find the customer.
3. Select the transaction type.
4. Enter the amount.
5. Save the transaction.

For shopkeepers who handle multiple customers throughout the day, this process can become repetitive.

Voice-based entry aims to reduce manual effort and make transaction recording more convenient.

## 10.3 What Is AI Voice Transaction Entry?

AI voice transaction entry is a feature that converts a spoken transaction instruction into structured information that the application can process.

For example, a spoken sentence may contain:

- Customer name.
- Transaction amount.
- Transaction type.
- Transaction-related instruction.

The application processes the voice input and extracts the information required to create a transaction.

## 10.4 How Does It Work?

The general workflow is:

1. The shopkeeper activates the voice transaction feature.
2. The application captures the spoken input.
3. The voice input is processed through the configured speech and AI processing workflow.
4. The backend receives the extracted or transcribed information.
5. The transaction details are identified.
6. The backend validates the customer and transaction information.
7. The transaction is processed and stored.
8. The frontend displays the result.

### Architecture Flow

```text
        SHOPKEEPER
             |
             v
        VOICE INPUT
             |
             v
      SPEECH PROCESSING
             |
             v
      AI INFORMATION EXTRACTION
             |
             v
        FASTAPI BACKEND
             |
             v
      CUSTOMER VALIDATION
             |
             v
     TRANSACTION PROCESSING
             |
             v
      NEON POSTGRESQL
             |
             v
       RESULT TO FRONTEND
```

## 10.5 Role of AI in Voice Processing

AI helps interpret natural language instructions.

For example, consider this sentence:

"Rahul ko 500 rupaye udhar diye."

The application needs to identify the important information:

| Information | Extracted value |
|---|---|
| Customer | Rahul |
| Amount | ₹500 |
| Transaction meaning | Credit given |

This is an example of converting natural language into structured transaction information.

The AI processing layer helps identify the meaning of the spoken instruction instead of requiring users to follow a strict command format.

## 10.6 Role of Groq API

The project uses Groq APIs as part of its AI integration.

The configured AI provider helps process language-based instructions and extract meaningful information from user input.

The backend communicates with the AI service and uses the returned result in its transaction processing workflow.

API credentials should be stored securely in environment variables rather than hard-coded into the source code.

## 10.7 Customer Validation

Extracting a customer name from a voice instruction does not automatically mean that the correct customer has been identified.

For example, a shop may have two customers with similar names.

Therefore, the backend needs to validate the extracted customer information before processing the transaction.

This is important because an incorrect customer match can create inaccurate financial records.

## 10.8 Why Is This Feature Useful?

Voice transaction entry can help shopkeepers:

- Record transactions more quickly.
- Reduce manual typing.
- Interact with the application naturally.
- Save time during busy business hours.
- Make digital ledger management easier.

## 10.9 Important Considerations

Voice-based financial operations require careful validation.

The application should consider:

- Incorrect speech recognition.
- Similar customer names.
- Incorrect transaction amounts.
- Missing information.
- Network failures.
- Repeated transaction requests.

For important financial operations, the extracted details should be validated before they are saved.

## 10.10 Final Summary

In this module, we implemented AI-powered voice transaction entry.

The feature allows shopkeepers to describe transactions using natural language instead of manually entering every detail.

The AI processing workflow helps extract meaningful transaction information, while the backend handles validation and transaction processing.

**The main objective was to make digital ledger management faster, easier, and more natural through voice interaction.**

# 11. Multilingual AI Voice Transaction Processing

## 11.1 Introduction

Universal Digital Khata is designed for shopkeepers who may prefer communicating in their regional language rather than English.

In India, people commonly communicate in languages such as Hindi, Marathi, and other regional languages.

If a digital ledger application supports only English commands, some shopkeepers may find it difficult to use.

To make the application more accessible, we implemented multilingual AI voice transaction processing.

This feature allows users to provide transaction instructions in different supported languages.

## 11.2 Why Did We Need Multilingual Support?

India has many languages and regional communication styles.

For example, a shopkeeper may naturally say:

- "Rahul ko 500 rupaye udhar diye."
- "राहुलला ५०० रुपये उधार दिले."
- "Rahul la 500 rupaye udhar dile."

These sentences express a similar transaction instruction but use different languages or writing styles.

We wanted the application to understand natural user instructions instead of forcing every shopkeeper to speak in English.

## 11.3 What Is Multilingual AI Processing?

Multilingual AI processing allows an AI-based system to understand and process input provided in different languages.

In our application, this capability is used for voice-based transaction instructions.

The system processes the spoken input and identifies the relevant transaction information.

The extracted information can then be used by the backend to process the transaction.

## 11.4 How Does It Work?

The general workflow is:

1. The shopkeeper speaks in a supported language.
2. The application captures the voice input.
3. The speech processing workflow converts the input into text or otherwise prepares it for language processing.
4. The AI processing layer interprets the instruction.
5. Relevant transaction information is extracted.
6. The backend validates the customer and transaction details.
7. The transaction is processed.
8. The frontend displays the result.

### Architecture Flow

```text
       SHOPKEEPER
            |
            v
      REGIONAL LANGUAGE
            |
            v
        VOICE INPUT
            |
            v
     SPEECH PROCESSING
            |
            v
     MULTILINGUAL AI
            |
            v
   STRUCTURED TRANSACTION DATA
            |
            v
       FASTAPI BACKEND
            |
            v
    CUSTOMER VALIDATION
            |
            v
   TRANSACTION PROCESSING
            |
            v
     NEON POSTGRESQL
            |
            v
      FRONTEND RESPONSE
```

## 11.5 Example of Multilingual Processing

Consider the following instructions:

**Hindi:**

"Rahul ko 500 rupaye udhar diye."

**Marathi:**

"राहुलला ५०० रुपये उधार दिले."

**English:**

"Give Rahul 500 rupees on credit."

These instructions express the same basic transaction meaning.

The AI processing layer aims to identify the common structured information.

Example:

| Field | Extracted information |
|---|---|
| Customer name | Rahul |
| Amount | ₹500 |
| Transaction type | Credit |

This demonstrates how different language inputs can be converted into a common transaction structure.

## 11.6 Handling Different Ways of Speaking

Users may express the same instruction in different ways.

For example:

- Rahul ko 500 udhar diye.
- Rahul ne 500 ka saman liya.
- Rahul ka 500 rupaye baki hai.

The application needs to understand the context of the instruction.

This is where natural language processing becomes useful.

The AI layer helps interpret the meaning of the instruction rather than depending only on exact keyword matching.

## 11.7 Customer Matching Challenges

Multilingual processing introduces additional challenges.

A customer name may be spoken or written in different ways.

For example:

- Rahul
- राहुल
- Rahool

These forms may refer to the same customer, depending on the shop's customer records.

Customer matching is important because the application must connect a transaction to the correct customer.

Incorrect matching can create financial record errors.

Therefore, customer validation is an important part of the processing workflow.

## 11.8 Improvements in Multilingual Processing

The project includes improvements to multilingual voice extraction and customer matching.

The objective of these improvements is to make the system more reliable when users speak naturally or use different language variations.

This is particularly important in real-world shop environments, where people may mix languages and use informal expressions.

## 11.9 Benefits

- Better accessibility for regional-language users.
- Natural voice-based interaction.
- Reduced dependency on English.
- Easier transaction entry.
- Support for different speaking styles.
- Improved customer matching.
- Better user experience for Indian shopkeepers.

## 11.10 Final Summary

In this module, we implemented multilingual AI voice transaction processing.

The feature allows shopkeepers to provide transaction instructions in supported languages and uses AI-based language processing to identify the relevant transaction information.

We also worked on improving multilingual extraction and customer matching.

**The main objective was to make Universal Digital Khata accessible to shopkeepers who prefer using their own language for daily business activities.**


# 12. Multilingual Voice Extraction and Customer Matching Improvements

## 12.1 Introduction

In Universal Digital Khata, shopkeepers can record transactions using natural-language voice instructions.

However, processing voice instructions is not always straightforward.

Users may speak in different languages, use informal words, mix languages, or pronounce customer names differently.

For example:

- Rahul ko 500 rupaye udhar diye.
- राहुल को ५०० रुपये उधार दिए।
- Rahul la 500 rupaye udhar dile.

Although these instructions may express the same transaction, their sentence structures and language patterns are different.

To improve the reliability of voice-based transactions, we worked on multilingual voice extraction and customer matching improvements.

## 12.2 Why Were These Improvements Needed?

A voice-based transaction system must correctly identify important information.

For example:

- Customer name.
- Transaction amount.
- Transaction type.
- Transaction meaning.

If the system extracts an incorrect customer name or amount, it may create an incorrect financial record.

Therefore, improving information extraction and customer matching was important.

## 12.3 What Is Information Extraction?

Information extraction is the process of identifying useful information from unstructured text.

For example, consider this instruction:

"Rahul ko 500 rupaye udhar diye."

The system needs to identify:

| Field | Extracted information |
|---|---|
| Customer | Rahul |
| Amount | ₹500 |
| Transaction type | Credit |

The original sentence is unstructured text, while the extracted information is structured data.

This structured information can then be used by the backend transaction workflow.

## 12.4 What Is Customer Matching?

Customer matching is the process of identifying the correct customer record from the available customer information.

For example, a shop may contain the following records:

- Rahul Sharma
- Rahul Verma
- Rohit Sharma

If the shopkeeper says "Rahul ko 500 diye", the system needs to identify the intended Rahul.

This becomes more challenging when names are spoken differently or written in different scripts.

## 12.5 Challenges in Multilingual Customer Matching

Some common challenges include:

**Different Scripts:** A name may appear in English or Devanagari.

**Different Pronunciations:** Users may pronounce the same name differently.

**Spelling Variations:** The same name may have different spellings.

**Similar Names:** Multiple customers may have similar names.

**Mixed Languages:** Users may combine Hindi, Marathi, and English in one sentence.

These challenges make customer identification an important part of the voice transaction workflow.

## 12.6 General Processing Workflow

The improved processing workflow can be understood as follows:

1. The shopkeeper provides a voice instruction.
2. The speech processing workflow prepares the input.
3. The multilingual processing layer interprets the instruction.
4. Relevant transaction information is extracted.
5. The customer name is matched against available customer records.
6. The backend validates the extracted information.
7. The transaction workflow processes the validated information.

### Architecture Flow

```text
       VOICE INSTRUCTION
              |
              v
       SPEECH PROCESSING
              |
              v
      MULTILINGUAL EXTRACTION
              |
              v
     STRUCTURED INFORMATION
              |
              v
       CUSTOMER MATCHING
              |
              v
       BACKEND VALIDATION
              |
              v
      TRANSACTION PROCESSING
```

## 12.7 Why Is Validation Important?

AI-generated information should not automatically be treated as correct.

For example, if the AI extracts an amount of ₹5,000 instead of ₹500, the transaction may become incorrect.

Similarly, matching a customer to the wrong record can affect financial history.

Therefore, validation is important before processing financial transactions.

## 12.8 Benefits

- Better handling of multilingual instructions.
- Improved extraction of transaction information.
- Better customer identification.
- Support for different pronunciations and spelling variations.
- Reduced risk of incorrect customer selection.
- More reliable voice-based transaction processing.

## 12.9 Final Summary

In this module, we improved multilingual voice information extraction and customer matching.

The objective was to make the voice transaction workflow more reliable when shopkeepers use regional languages, mixed-language sentences, or different pronunciations.

**The main objective was to improve the accuracy of converting natural-language instructions into structured transaction information.**


# 13. Customer Credit Risk Dashboard

## 13.1 Introduction

Universal Digital Khata includes AI-based credit risk analysis to help shopkeepers understand customer payment behavior.

However, analysis results are more useful when they are presented in a clear and understandable interface.

To make these insights accessible, we implemented a Customer Credit Risk Dashboard.

This dashboard provides a dedicated view for understanding customer-related credit risk information.

## 13.2 Why Did We Need a Credit Risk Dashboard?

A shopkeeper may have many customers with different payment histories.

Checking each customer's transactions manually can be time-consuming.

A dedicated dashboard helps organize customer credit information and makes it easier to review customers who may require attention.

## 13.3 What Is a Customer Credit Risk Dashboard?

A Customer Credit Risk Dashboard is a user interface that presents customer-related credit information and risk insights.

It connects the backend credit risk analysis functionality with the frontend.

Instead of presenting raw transaction records only, the dashboard aims to provide a more understandable view of customer credit information.

## 13.4 How Does It Work?

The general workflow is:

1. The shopkeeper opens the credit risk dashboard.
2. The frontend requests the required customer credit information.
3. The backend identifies the authenticated user's permitted shop.
4. The backend retrieves relevant customer and transaction information.
5. Credit risk analysis results are prepared.
6. The API returns the information to the frontend.
7. The dashboard displays the available insights.

### Architecture Flow

```text
       SHOPKEEPER
            |
            v
    CREDIT RISK DASHBOARD
            |
            v
        FASTAPI API
            |
            v
     CUSTOMER INFORMATION
            |
            v
    TRANSACTION INFORMATION
            |
            v
     CREDIT RISK ANALYSIS
            |
            v
       API RESPONSE
            |
            v
     FRONTEND DISPLAY
```

## 13.5 Information Presented in the Dashboard

A customer credit risk dashboard can present useful information such as:

**Customer Information:** Helps identify the customer whose credit information is being reviewed.

**Outstanding Credit:** Shows the amount currently owed by the customer, where available.

**Payment History:** Helps review previous customer payments.

**Credit Risk Information:** Presents the available risk assessment.

**Customer Comparison:** Can help shopkeepers review differences in customer credit behavior when supported by the dashboard data.

The exact metrics and visual components depend on the implemented dashboard response.

## 13.6 Role of Frontend and Backend

### Frontend Responsibilities

- Display customer credit information.
- Present available risk insights.
- Organize information in a readable format.
- Allow shopkeepers to access the credit risk section.

### Backend Responsibilities

- Validate API requests.
- Enforce user and shop authorization.
- Retrieve relevant customer and transaction data.
- Provide credit risk information.
- Return structured API responses.

Separating these responsibilities makes the application easier to maintain.

## 13.7 How Does It Help Shopkeepers?

Suppose a shopkeeper has several customers with outstanding balances.

Some customers regularly make payments, while others frequently delay payments.

The dashboard helps the shopkeeper review available credit information in one place.

This can support decisions such as:

- Whether to review a customer's outstanding balance.
- Which customers may need payment reminders.
- Which customer accounts need closer attention.

The dashboard provides decision-support information. The shopkeeper remains responsible for making the final business decision.

## 13.8 Benefits

- Centralized customer credit information.
- Easier access to risk insights.
- Better understanding of customer payment behavior.
- Reduced manual checking.
- Improved visibility of outstanding credit.
- Better integration between AI analysis and the user interface.

## 13.9 Final Summary

In this module, we implemented a Customer Credit Risk Dashboard to present customer-related credit risk information in a more understandable way.

It connects the backend analysis functionality with the frontend interface and helps shopkeepers review available customer credit insights.

**The main objective was to make AI-based credit information useful and accessible through a dedicated dashboard.**


# 14. Customer Notification and Payment Reminder System

## 14.1 Introduction

In a traditional shop, shopkeepers often need to personally remind customers about pending payments.

When the number of customers increases, remembering every outstanding payment becomes difficult.

To make this process easier, we implemented a Customer Notification and Payment Reminder System in Universal Digital Khata.

This functionality supports communication between shopkeepers and customers regarding outstanding payments.

## 14.2 Why Did We Need a Notification System?

A digital ledger should not only maintain transaction records but also help shopkeepers manage customer communication.

For example:

- A customer has an outstanding balance.
- The shopkeeper wants to remind the customer about the pending payment.
- The application helps initiate the reminder process.

This reduces the need to remember and manually manage every reminder.

## 14.3 What Is a Payment Reminder?

A payment reminder is a message that informs a customer about an outstanding amount or pending payment.

For example:

"Your payment of ₹500 is pending. Please contact the shop for payment details."

The exact message content depends on the notification functionality.

## 14.4 How Does the Reminder System Work?

The general workflow is:

1. The shopkeeper opens the customer or reminder section.
2. The shopkeeper selects the relevant customer.
3. The reminder request is submitted to the backend.
4. FastAPI processes the request.
5. The backend retrieves the required customer and payment information.
6. The notification functionality prepares the reminder.
7. The configured communication mechanism handles delivery.
8. The application provides the appropriate result.

### Architecture Flow

```text
       SHOPKEEPER
            |
            v
      CUSTOMER SECTION
            |
            v
      REMINDER REQUEST
            |
            v
        FASTAPI API
            |
            v
     CUSTOMER / PAYMENT DATA
            |
            v
     NOTIFICATION PROCESSING
            |
            v
   CONFIGURED DELIVERY CHANNEL
            |
            v
         CUSTOMER
```

## 14.5 Role of Customer Information

Customer information is important for sending reminders to the correct person.

For example, the application may need:

- Customer identity.
- Customer contact information.
- Relevant outstanding amount.
- Reminder message information.

The backend must use the correct customer record and verify the relevant shop association before processing a reminder.

## 14.6 Why Is Notification Functionality Useful?

Without a reminder system, shopkeepers may need to:

- Search for customer contact details.
- Calculate pending amounts manually.
- Write reminder messages.
- Send reminders separately.

An integrated reminder workflow can reduce these manual steps.

## 14.7 Integration with Transaction Management

The reminder system is closely connected to Transaction Management.

Transaction Management maintains credit and payment information.

The reminder system can use relevant outstanding payment information to support customer communication.

For example:

- A customer has ₹1,000 outstanding.
- The customer makes a payment of ₹400.
- The remaining amount is ₹600.

A reminder should use the appropriate current outstanding information rather than an outdated amount.

## 14.8 Important Considerations

A notification system should consider:

- Correct customer contact information.
- Correct outstanding amount.
- Avoiding unnecessary repeated reminders.
- Appropriate message content.
- Delivery failures.
- Customer privacy.
- Shop ownership and authorization.

The application should not treat a reminder request as proof that the message was successfully delivered. Delivery status depends on the configured communication provider.

## 14.9 Benefits

- Easier payment reminder management.
- Better communication with customers.
- Reduced manual follow-up work.
- Integration with customer records.
- Integration with transaction information.
- Improved digital ledger experience.

## 14.10 Final Summary

In this module, we implemented customer notification and payment reminder functionality.

The system supports shopkeepers in initiating reminders using customer and payment-related information.

It connects customer management and transaction management with customer communication functionality.

**The main objective was to reduce manual payment follow-up work and make customer communication easier.**


# 15. Multilingual Voice Processing Improvements

## 15.1 Introduction

Universal Digital Khata supports voice-based transaction entry so that shopkeepers can record transactions using natural language.

However, real-world users do not always speak in a fixed format. They may use different languages, regional expressions, mixed-language sentences, and different pronunciations.

To improve the voice transaction experience, we worked on improving multilingual voice processing.

The main focus was to make the system better at understanding natural transaction instructions and extracting the required information.

## 15.2 Why Were Improvements Needed?

A voice processing system may face several challenges:

- Different ways of expressing the same transaction.
- Regional language variations.
- Mixed Hindi, Marathi, and English sentences.
- Different pronunciations of customer names.
- Incorrectly recognized amounts.
- Incomplete transaction instructions.

These issues can affect the accuracy of transaction processing.

## 15.3 Natural Language Variations

Consider these examples:

- Rahul ko 500 rupaye udhar diye.
- Rahul ko paanch sau rupaye diye.
- राहुल को ५०० रुपये उधार दिए।
- राहुलला ५०० रुपये उधार दिले.

These instructions may represent similar transaction information.

The system needs to understand the meaning rather than depend only on an exact sentence format.

## 15.4 What Did We Improve?

The project includes improvements to multilingual voice transaction processing.

The objectives include:

1. Better interpretation of natural-language instructions.
2. Improved extraction of transaction information.
3. Better handling of different language expressions.
4. Improved customer name matching.
5. More reliable transaction processing.

## 15.5 General Processing Workflow

```text
       VOICE INPUT
            |
            v
      SPEECH PROCESSING
            |
            v
    MULTILINGUAL AI PROCESSING
            |
            v
   TRANSACTION INFORMATION
         EXTRACTION
            |
            v
     CUSTOMER MATCHING
            |
            v
      DATA VALIDATION
            |
            v
    TRANSACTION PROCESSING
```

## 15.6 Why Is Accuracy Important?

A voice transaction system handles financial information.

If the system incorrectly identifies a customer or amount, it can create inaccurate records.

For example, confusing ₹500 with ₹5,000 can significantly affect a customer's account.

Therefore, extracted information must be validated before it is used to create financial records.

## 15.7 Benefits

- Better multilingual understanding.
- Improved natural-language processing.
- More reliable transaction information extraction.
- Better handling of regional expressions.
- Improved customer matching.
- Better user experience for shopkeepers.

## 15.8 Final Summary

In this module, we improved multilingual voice transaction processing to handle natural-language variations more effectively.

The focus was on improving information extraction, customer matching, and the reliability of voice-based transaction workflows.

**The main objective was to make voice-based digital ledger operations more accurate and convenient for regional-language users.**



# 16. Transaction Idempotency and Customer Validation

## 16.1 Introduction

Transaction Management is a critical part of Universal Digital Khata because it handles customer credit and payment records.

In financial applications, duplicate transactions and incorrect customer selection can create serious problems.

For example, if a transaction request is submitted twice due to a network issue, the application may accidentally record the same transaction more than once.

To improve reliability, we implemented transaction idempotency support and customer validation.

## 16.2 What Is Transaction Idempotency?

Idempotency is a concept used in API development to prevent repeated requests from creating duplicate operations.

In our application, transaction idempotency helps identify repeated submissions of the same logical transaction request.

For example:

```text
First request:
Transaction Amount = ₹500
Idempotency Key = ABC123

Repeated request:
Transaction Amount = ₹500
Idempotency Key = ABC123
```

The backend can use the same idempotency key to recognize that the request has already been processed.

This helps prevent duplicate transaction creation.

## 16.3 Why Is Idempotency Important?

Duplicate requests can happen because of:

- Slow internet connections.
- Network interruptions.
- Repeated button clicks.
- Automatic API retries.
- Frontend request resubmissions.

In a financial application, processing the same logical transaction multiple times can produce incorrect customer balances.

Idempotency helps reduce this risk.

## 16.4 How Does It Work?

The general workflow is:

1. The frontend submits a transaction request with an idempotency key.
2. The backend receives the request.
3. The backend checks whether the key has already been processed.
4. If it is a new request, the transaction is processed.
5. If it is a repeated request, duplicate processing is prevented according to the implemented logic.
6. The backend returns the appropriate response.

### Architecture Flow

```text
       TRANSACTION REQUEST
               |
               v
        IDEMPOTENCY KEY
               |
               v
        FASTAPI BACKEND
               |
               v
        CHECK REQUEST KEY
               |
          +----+----+
          |         |
          v         v
       NEW KEY   EXISTING KEY
          |         |
          v         v
      PROCESS    PREVENT
    TRANSACTION  DUPLICATE
          |         |
          +----+----+
               |
               v
          API RESPONSE
```

## 16.5 What Is Customer Validation?

Customer validation ensures that the customer associated with a transaction is valid and belongs to the appropriate shop.

For example, suppose a shopkeeper selects a customer and records a credit transaction.

Before processing the transaction, the backend should verify that:

- The customer record exists.
- The customer is associated with the correct shop.
- The authenticated user has permission to access that customer.

This helps prevent transactions from being recorded against invalid or unauthorized customer records.

## 16.6 Why Is Customer Validation Important?

Customer validation protects the accuracy and integrity of financial records.

Without proper validation:

- A transaction may reference a non-existing customer.
- A transaction may be associated with the wrong shop.
- Unauthorized users may attempt to access another shop's records.

Backend validation helps prevent these problems.

## 16.7 Combined Transaction Processing Workflow

```text
      TRANSACTION REQUEST
               |
               v
        AUTHENTICATION
               |
               v
        CUSTOMER VALIDATION
               |
               v
       IDEMPOTENCY CHECK
               |
               v
       TRANSACTION LOGIC
               |
               v
       DATABASE OPERATION
               |
               v
          API RESPONSE
```

## 16.8 Benefits

- Reduced duplicate transaction processing.
- Better API reliability.
- Improved financial record accuracy.
- Better customer validation.
- Stronger data integrity.
- Better protection against invalid transaction requests.

## 16.9 Final Summary

In this module, we implemented transaction idempotency support and customer validation.

Idempotency helps prevent repeated transaction requests from creating duplicate records, while customer validation ensures that transactions are associated with valid and permitted customer records.

**The main objective was to make financial transaction processing more reliable and protect the accuracy of customer records.**



# 17. Responsive Workspace Layout and Authentication Flow

## 17.1 Introduction

Universal Digital Khata is designed for shopkeepers who may use different devices to manage their business records.

Some users may access the application through desktop computers, while others may use mobile phones or tablets.

To provide a consistent experience across different screen sizes, we implemented a responsive workspace layout.

We also worked on improving the authentication flow to provide a better user experience.

## 17.2 What Is a Responsive Layout?

A responsive layout is a user interface that adjusts its structure and appearance according to the device's screen size.

For example:

- Desktop users may see a wider workspace.
- Tablet users may see a more compact layout.
- Mobile users may see a vertically arranged interface.

The objective is to make the application usable without requiring a separate website for every device.

## 17.3 Why Did We Need Responsive Design?

Shopkeepers may need to access their customer and transaction information while working in their shops.

A desktop-only interface would make the application less convenient for users who prefer mobile devices.

Responsive design helps improve:

- Mobile usability.
- Navigation.
- Content readability.
- Accessibility.
- Overall user experience.

## 17.4 What Is a Workspace Layout?

A workspace layout provides a consistent structure for the main application interface.

A typical workspace may contain:

- Navigation section.
- Main content area.
- Dashboard section.
- Customer management area.
- Transaction-related pages.
- Other application features.

Using a shared layout helps maintain a consistent appearance across different application pages.

## 17.5 Authentication Flow

Authentication flow controls how users enter and access the application.

A typical flow includes:

1. The user opens the application.
2. The application checks the user's authentication state.
3. Unauthenticated users are directed to the login experience.
4. Authenticated users can access permitted workspace pages.
5. Protected operations are verified by the backend.

The frontend experience and backend authorization checks work together to protect application resources.

## 17.6 General Architecture Flow

```text
         USER OPENS APP
                |
                v
        AUTHENTICATION CHECK
                |
          +-----+-----+
          |           |
          v           v
     UNAUTHENTICATED  AUTHENTICATED
          |           |
          v           v
       LOGIN       WORKSPACE
                      |
                      v
                APPLICATION PAGES
```

## 17.7 Why Did We Separate Layout and Page Content?

A shared workspace layout avoids repeating the same navigation and structural components on every page.

It also makes future interface changes easier.

For example, updating the shared navigation structure can improve the experience across multiple pages.

This approach supports better frontend code organization and maintainability.

## 17.8 Benefits

- Consistent application layout.
- Better mobile and desktop experience.
- Improved navigation.
- Better authentication experience.
- Reusable frontend structure.
- Easier maintenance.
- Better user experience.

## 17.9 Final Summary

In this module, we implemented a responsive workspace layout and improved the authentication flow.

The responsive layout helps the application adapt to different screen sizes, while the authentication flow provides a structured experience for accessing the workspace.

**The main objective was to create a consistent, responsive, and user-friendly application interface.**



# 18. AI Assistant for Voice and Text Transactions

## 18.1 Introduction

Universal Digital Khata includes AI-powered functionality to simplify transaction entry.

Initially, voice-based transaction entry allows shopkeepers to speak their transaction instructions.

We extended this concept with an AI Assistant that supports voice and text-based transaction interactions.

This provides users with a more flexible way to communicate transaction instructions to the application.

## 18.2 What Is an AI Assistant?

An AI Assistant is a software feature that accepts natural-language input and helps users perform supported tasks.

In our project, the assistant focuses on transaction-related interactions.

For example, users can provide instructions such as:

- "Rahul ko 500 rupaye udhar diye."
- "Add 300 rupees payment from Amit."
- "Rahul ka transaction record karo."

The assistant processes the instruction and helps prepare the relevant transaction information.

## 18.3 Why Did We Add Text and Voice Support?

Different users have different interaction preferences.

Some users may prefer speaking, while others may prefer typing.

Supporting both methods makes the application more flexible.

**Voice Input:** Useful when the shopkeeper wants to speak naturally.

**Text Input:** Useful when speaking is inconvenient or when the user prefers typing.

Both interaction methods can connect to the transaction processing workflow.

## 18.4 How Does It Work?

The general workflow is:

1. The user opens the AI Assistant.
2. The user provides a voice or text instruction.
3. The input is prepared for AI processing.
4. The AI processing layer interprets the instruction.
5. Relevant transaction information is extracted.
6. The backend validates the customer and transaction details.
7. The transaction workflow processes the validated request.
8. The frontend displays the result.

### Architecture Flow

```text
          USER
            |
            v
      AI ASSISTANT
            |
       +----+----+
       |         |
       v         v
    VOICE      TEXT
     INPUT     INPUT
       |         |
       +----+----+
            |
            v
       AI PROCESSING
            |
            v
    INFORMATION EXTRACTION
            |
            v
     BACKEND VALIDATION
            |
            v
    TRANSACTION PROCESSING
            |
            v
       DATABASE
```

## 18.5 Role of AI

The AI processing layer helps understand natural-language instructions.

For example:

"Rahul ko 500 rupaye udhar diye."

The system needs to identify:

| Field | Value |
|---|---|
| Customer | Rahul |
| Amount | ₹500 |
| Transaction type | Credit |

The extracted information can then be passed to the backend for validation and processing.

## 18.6 Role of FastAPI

FastAPI acts as the backend layer for handling assistant-related requests.

Its responsibilities include:

- Receiving requests from the frontend.
- Processing the required business logic.
- Validating transaction information.
- Connecting with the AI integration.
- Coordinating transaction processing.
- Returning API responses.

## 18.7 Why Is Validation Necessary?

An AI Assistant may interpret an instruction incorrectly.

For example:

- It may identify the wrong customer.
- It may extract an incorrect amount.
- It may misunderstand credit and payment instructions.
- It may receive an incomplete instruction.

Therefore, the backend must validate the extracted information before creating financial records.

## 18.8 Benefits

- Voice-based transaction interaction.
- Text-based transaction interaction.
- Natural-language communication.
- Reduced manual data entry.
- Flexible user experience.
- Integration with existing transaction management.
- Improved accessibility.

## 18.9 Final Summary

In this module, we implemented an AI Assistant that supports voice and text-based transaction interactions.

The assistant helps users provide natural-language transaction instructions, while the backend handles validation and transaction processing.

**The main objective was to provide a flexible AI-powered interface for recording business transactions.**


# 19. Customer Creation and Form

## 19.1 Introduction

Customer Management is an important part of Universal Digital Khata.

Before recording credit or payment transactions, shopkeepers need to maintain customer records.

To make customer onboarding easier, we implemented a Customer Creation Form in the frontend.

This form provides an interface for entering customer information and submitting it to the backend.

## 19.2 Why Did We Need a Customer Creation Form?

A digital ledger application needs a simple way to add customers.

Without a customer creation feature, shopkeepers would not be able to organize customer-specific transaction records effectively.

A dedicated form makes it easier to enter customer details and connect them with the appropriate shop.

## 19.3 What Is a Customer Creation Form?

A customer creation form is a frontend interface that collects the information required to create a customer record.

The user enters the available customer details and submits the form.

The frontend sends the information to the Customer Management API.

The backend validates the request and stores the customer information in the database.

## 19.4 Customer Creation Workflow

1. The shopkeeper opens the customer section.
2. The shopkeeper selects the add customer option.
3. The customer form is displayed.
4. The user enters the required information.
5. The frontend validates the form where applicable.
6. The frontend sends the request to FastAPI.
7. The backend validates the submitted data.
8. The customer record is stored in PostgreSQL.
9. The frontend displays the operation result.

### Architecture Flow

```text
      SHOPKEEPER
           |
           v
    CUSTOMER FORM
           |
           v
   FRONTEND VALIDATION
           |
           v
      FASTAPI API
           |
           v
    BACKEND VALIDATION
           |
           v
      SQLALCHEMY ORM
           |
           v
    NEON POSTGRESQL
           |
           v
       API RESPONSE
           |
           v
     CUSTOMER LIST
```

## 19.5 Role of Frontend

The frontend is responsible for:

- Displaying the customer creation form.
- Collecting customer information.
- Handling user input.
- Providing basic form validation.
- Submitting the request to the backend.
- Displaying success or error feedback.

## 19.6 Role of Backend

The backend is responsible for:

- Receiving customer creation requests.
- Validating incoming data.
- Checking the authenticated user's permissions.
- Associating the customer with the appropriate shop.
- Creating the customer record.
- Returning the API response.

Backend validation is important because frontend validation alone cannot protect database operations.

## 19.7 Why Is Form Validation Important?

Form validation helps prevent incorrect or incomplete customer information.

For example:

- Required information should be provided.
- Contact information should follow the expected format.
- Invalid requests should be rejected.
- The user should receive appropriate error feedback.

This improves data quality and the overall user experience.

## 19.8 Integration with Other Modules

Customer creation is connected to several application features.

**Transaction Management:** Newly created customers can be associated with transactions.

**Customer Dashboard:** Customer records can be displayed and managed.

**AI Voice Assistant:** Voice instructions can refer to customers stored in the database.

**Notifications:** Customer contact information can support communication features.

## 19.9 Benefits

- Easy customer onboarding.
- Structured customer information.
- Better user experience.
- Integration with transaction management.
- Improved data organization.
- Foundation for customer-related AI features.

## 19.10 Final Summary

In this module, we implemented the Customer Creation Form in the frontend and connected it with the backend customer management workflow.

This allows shopkeepers to enter customer information and maintain customer records digitally.

**The main objective was to make customer registration simple and connect it with the remaining application modules.**


# 20. Offline Transaction Storage and Synchronization

## 20.1 Introduction

Shopkeepers may sometimes experience slow or unstable internet connections.

If the application requires a constant internet connection for every operation, users may face difficulties while recording transactions.

To improve reliability, we implemented offline transaction storage and synchronization.

This feature uses IndexedDB to store transaction information locally in the browser and supports synchronization with the backend.

## 20.2 What Is Offline Storage?

Offline storage allows a web application to store selected information locally on the user's device.

This information can remain available even when the internet connection is temporarily unavailable.

In our project, IndexedDB is used for local transaction storage.

This helps the application maintain pending transaction information before it can be synchronized with the backend.

## 20.3 What Is IndexedDB?

IndexedDB is a browser-based database API.

It allows web applications to store structured data locally.

Unlike simple key-value storage, IndexedDB supports storing multiple records and querying data through object stores and indexes.

It is useful for applications that need to maintain larger or more structured local datasets.

## 20.4 Why Did We Use IndexedDB?

We used IndexedDB because:

1. It supports structured data storage.
2. It works inside the browser.
3. It can store multiple transaction records.
4. It supports asynchronous database operations.
5. It helps maintain local application data.
6. It supports offline-first application workflows.

## 20.5 What Is Offline Transaction Storage?

Offline transaction storage means saving transaction information locally when it cannot immediately be processed by the backend.

For example:

1. A shopkeeper enters a transaction.
2. The internet connection is unavailable.
3. The application stores the transaction locally.
4. The transaction remains pending synchronization.
5. When connectivity becomes available, the application can attempt to synchronize it with the backend.

This helps reduce dependency on continuous internet connectivity.

## 20.6 How Does Synchronization Work?

Synchronization is the process of transferring locally stored information to the backend and updating its status.

The general workflow is:

1. The user creates a transaction.
2. The application checks whether the backend can be reached.
3. If the transaction cannot be sent immediately, it is stored locally.
4. The application keeps track of pending transactions.
5. When connectivity becomes available, synchronization is attempted.
6. The backend receives and validates the transaction.
7. The backend processes the transaction.
8. The application updates the local synchronization status.

### Architecture Flow

```text
       USER CREATES TRANSACTION
                 |
                 v
          FRONTEND APP
                 |
                 v
        CHECK CONNECTION
                 |
           +-----+-----+
           |           |
           v           v
        ONLINE       OFFLINE
           |           |
           v           v
     BACKEND API    INDEXEDDB
           |           |
           v           v
      POSTGRESQL   PENDING DATA
           |           |
           |           v
           |     CONNECTION RETURNS
           |           |
           |           v
           |     SYNC REQUEST
           |           |
           +-----+-----+
                 |
                 v
         BACKEND VALIDATION
                 |
                 v
         TRANSACTION STORAGE
```

## 20.7 What Is Offline-First Architecture?

Offline-first architecture is an application design approach in which important operations are designed to work with local data even when the network is unavailable.

Instead of depending entirely on the server for every interaction, the application can temporarily use local storage.

When connectivity returns, the application synchronizes pending changes with the backend.

This approach is useful for applications that operate in environments with unreliable internet connections.

## 20.8 Role of IndexedDB

IndexedDB acts as the local storage layer.

It helps the frontend:

- Store pending transaction records.
- Maintain local transaction information.
- Retrieve locally stored records.
- Keep information available during temporary connectivity problems.
- Support the synchronization workflow.

## 20.9 Role of Backend

The backend remains responsible for processing and storing the application's authoritative transaction records.

During synchronization, the backend should validate incoming transaction information before saving it.

The local database should not be treated as proof that a transaction has been permanently recorded in the server database.

## 20.10 Why Is Idempotency Important During Synchronization?

Offline synchronization may involve retrying requests when network connections fail.

For example, the frontend may send a transaction request, but the connection may fail before it receives the response.

The frontend may not know whether the backend processed the request.

If it retries the same transaction without protection, a duplicate record may be created.

Transaction idempotency helps reduce this risk by allowing the backend to identify repeated submissions of the same logical transaction.

This is an important connection between Module 16 and the offline synchronization feature.

## 20.11 Important Considerations

Offline financial operations require careful handling.

The application should consider:

- Duplicate synchronization requests.
- Network failures.
- Pending transaction status.
- Data consistency.
- Failed synchronization attempts.
- Local storage limitations.
- Secure handling of locally stored information.

A transaction should be clearly identified as pending until the backend confirms successful processing.

## 20.12 Benefits

- Better experience during internet interruptions.
- Local transaction storage.
- Support for pending transactions.
- Reduced dependency on continuous connectivity.
- Synchronization with the backend.
- Better reliability for shopkeepers.
- Integration with transaction idempotency.

## 20.13 Final Summary

In this module, we implemented offline transaction storage and synchronization using IndexedDB.

The feature allows transaction information to be stored locally when immediate backend communication is unavailable.

When connectivity returns, the application can synchronize pending transactions with the backend.

**The main objective was to make Universal Digital Khata more reliable in real-world shop environments where internet connectivity may not always be stable.**