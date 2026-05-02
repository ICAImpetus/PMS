# Backend MVC Architecture

## Overview
This backend follows a clean MVC (Model-View-Controller) pattern with an additional **Services Layer** for business logic. The architecture is simple, maintainable, and follows best practices.

## Directory Structure

```
backend/
├── config/              # Configuration files
│   └── env.js          # Environment variables
├── models/             # Data Models (Mongoose schemas)
│   ├── FilledForm.js
│   ├── HospitalModel.js
│   ├── AdminAgentModel.js
│   └── ...
├── controllers/        # Controllers (Request handlers)
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── hospital.controller.js
│   └── form.controller.js
├── services/          # Business Logic Layer
│   ├── auth.service.js
│   ├── user.service.js
│   ├── hospital.service.js
│   └── form.service.js
├── routes/           # API Routes
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── hospital.routes.js
│   ├── form.routes.js
│   └── index.js
├── middlewares/      # Custom Middleware
│   ├── auth.middleware.js
│   └── errorHandler.js
├── utils/           # Utility Functions
│   ├── database.js
│   └── response.js
├── app.js          # App configuration
└── server.js       # Server entry point
```

## Architecture Layers

### 1. Models (Data Layer)
- **Purpose**: Define data structure and interact with database
- **Technology**: Mongoose schemas
- **Location**: `/models`
- **Example**: `FilledForm.js`, `HospitalModel.js`

**Responsibilities**:
- Define schema structure
- Add validation rules
- Create indexes
- Define model methods

### 2. Services (Business Logic Layer)
- **Purpose**: Handle business logic and complex operations
- **Location**: `/services`
- **Example**: `auth.service.js`, `hospital.service.js`

**Responsibilities**:
- Business logic implementation
- Database operations (using Mongoose)
- Data transformation
- Complex queries and aggregations

**Benefits**:
- Keeps controllers thin
- Reusable business logic
- Easier to test
- Single source of truth for operations

### 3. Controllers (Request Handlers)
- **Purpose**: Handle HTTP requests and responses
- **Location**: `/controllers`
- **Example**: `auth.controller.js`, `form.controller.js`

**Responsibilities**:
- Receive HTTP requests
- Validate request data
- Call appropriate service methods
- Format and send responses
- Handle errors

**Pattern**:
```javascript
export const getUsers = async (req, res) => {
  try {
    // 1. Extract params
    const { page, limit } = req.query;
    
    // 2. Call service
    const result = await userService.getAllUsers(filters, pagination);
    
    // 3. Send response
    const response = successResponse(result.data, 'Success');
    res.status(200).json(response);
  } catch (error) {
    const response = errorResponse('Error', 500, error);
    res.status(500).json(response);
  }
};
```

### 4. Routes
- **Purpose**: Define API endpoints and map to controllers
- **Location**: `/routes`
- **Example**: `user.routes.js`, `hospital.routes.js`

**Pattern**:
```javascript
import express from 'express';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);

export default router;
```

**Central Configuration**: `/routes/index.js` imports all routes and mounts them with prefixes.

## API Structure

All new API endpoints are prefixed with `/api`:

```
/api/auth         - Authentication endpoints
/api/users        - User management
/api/hospitals    - Hospital management
/api/forms        - Form management
/api/health       - Health check
```

### Example Endpoints

**Authentication**:
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

**Users**:
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

**Hospitals**:
- `GET /api/hospitals` - Get all hospitals
- `POST /api/hospitals` - Create hospital
- `POST /api/hospitals/:hospitalId/branches` - Add branch
- `PUT /api/hospitals/:hospitalId/branches/:branchId` - Update branch

**Forms**:
- `GET /api/forms` - Get all forms
- `POST /api/forms` - Create form
- `GET /api/forms/stats/agent/:agentId/dashboard` - Dashboard stats

## Response Format

All API responses follow a standard format:

**Success Response**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "statusCode": 200
}
```

**Error Response**:
```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
  "error": "Detailed error"
}
```

## Database Layer

**Migration Complete**: Now uses **Mongoose only** (removed MongoDB native client).

**Benefits**:
- Single database approach
- Consistent patterns
- Schema validation
- Middleware hooks
- Better type safety

## Middleware

### Authentication Middleware
- **File**: `/middlewares/auth.middleware.js`
- **Usage**: Protect routes that require authentication

```javascript
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

// Protect route
router.get('/profile', authenticate, getProfile);

// Protect with role check
router.post('/admin', authenticate, authorize('admin', 'superadmin'), adminAction);
```

### Error Handling
- **File**: `/middlewares/errorHandler.js`
- Catches and formats all errors
- Provides consistent error responses

## Utilities

### Response Utilities
- **File**: `/utils/response.js`
- `successResponse()` - Format success responses
- `errorResponse()` - Format error responses
- `notFoundResponse()` - 404 responses

### Database Utilities
- **File**: `/utils/database.js`
- `isValidObjectId()` - Validate MongoDB IDs
- `getPaginationParams()` - Extract pagination
- `buildPaginationResponse()` - Format paginated data

## Best Practices

1. **Keep Controllers Thin**: Business logic goes in services
2. **Use Services**: All database operations through services
3. **Standard Responses**: Use response utilities
4. **Error Handling**: Try-catch in all async functions
5. **Validation**: Validate inputs in controllers
6. **Authentication**: Use middleware for protected routes

## Backward Compatibility

Legacy routes are temporarily maintained in `app.js` for backward compatibility with the current frontend. These will be removed once the frontend is updated to use new `/api/*` endpoints.

## Migration Notes

### What Changed:
-  Created services layer for business logic
-  Refactored controllers to use services
-  Organized routes with `/api` prefix
-  Migrated from MongoDB native client to Mongoose only
-  Standardized response formats
-  Added authentication middleware

### What Stays:
-  All existing models
-  All existing functionality
-  Backward compatibility with old routes

### Next Steps:
1. Update frontend to use new `/api/*` endpoints
2. Remove legacy route imports from `app.js`
3. Add unit tests for services
4. Add API documentation (Swagger/OpenAPI)

## Development

### Starting the Server
```bash
npm start
```

### Environment Variables
Create `.env` file:
```
MONGO_URL=mongodb://localhost:27017
DATABASE=crms
JWT_SECRET=your-secret-key
PORT=5000
```

### Adding a New Feature

1. **Create Model** (if needed): `/models/YourModel.js`
2. **Create Service**: `/services/your.service.js`
3. **Create Controller**: `/controllers/your.controller.js`
4. **Create Routes**: `/routes/your.routes.js`
5. **Register Routes**: Import in `/routes/index.js`

## Summary

This architecture provides:
- **Clear separation of concerns**
- **Maintainable and testable code**
- **Standardized patterns**
- **Easy to understand and extend**
- **Production-ready structure**
