# Frontend Architecture

## Overview
Frontend follows a clean architecture with **Pages** (Views)**, **Components**, and **Services**. Uses React with Redux for state management.

## Directory Structure

```
frontend/src/
├── pages/              # Page components (Views)
│   ├── Auth/
│   ├── Dashboard/
│   ├── Forms/
│   ├── Hospital/
│   └── Users/
├── components/        # Reusable components
│   ├── common/       # Shared UI components
│   ├── charts/       # Chart components
│   └── forms/        # Form components
├── services/        # API service layer
│   ├── api.service.js
│   ├── auth.service.js
│   ├── user.service.js
│   ├── hospital.service.js
│   └── form.service.js
├── contexts/        # React Context
│   ├── UserContext.jsx
│   └── ThemeContext.jsx
├── store/          # Redux store
│   └── store.js
├── slices/         # Redux slices
│   └── ...
├── hooks/          # Custom hooks
│   └── ...
├── utils/         # Utilities
│   └── ...
├── App.jsx       # Main app
└── main.jsx      # Entry point
```

## Architecture Layers

### 1. Services Layer (API)
- **Purpose**: Centralize all API calls
- **Location**: `/services`

**Benefits**:
- Single source of truth for API calls
- Easy to maintain and update
- Consistent error handling
- Auto token management

**Example** (`auth.service.js`):
```javascript
import { api } from './api.service.js';

const authService = {
  login: async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    localStorage.setItem('authToken', response.data.token);
    return response;
  }
};

export default authService;
```

### 2. Pages (Views)
- **Purpose**: Top-level route components
- **Location**: `/pages` (currently in `/scenes`)
- **One page per route**

### 3. Components
- **Purpose**: Reusable UI components
- **Location**: `/components`
- **Organization**:
  - `/common` - Buttons, Modals, Loaders
  - `/charts` - Chart components
  - `/forms` - Form components

### 4. State Management
- **Redux**: For global application state
- **Context API**: For theme, auth state
- **Local State**: Component-level state

## Services

### API Service (`api.service.js`)
Base Axios configuration with interceptors:

```javascript
// Auto-adds token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data);
  }
);
```

### Service Modules
All services export functions for API operations:

**Auth Service** (`auth.service.js`):
- `login(username, password)`
- `logout()`
- `getCurrentUser()`
- `isAuthenticated()`

**User Service** (`user.service.js`):
- `getAll(params)`
- `getById(id)`
- `create(userData)`
- `update(id, userData)`
- `delete(id)`

**Hospital Service** (`hospital.service.js`):
- `getAll(params)`
- `getById(id)`
- `create(hospitalData)`
- `addBranch(hospitalId, branchData)`
- `updateBranch(hospitalId, branchId, data)`

**Form Service** (`form.service.js`):
- `getAll(params)`
- `create(formData)`
- `getStatsByAgent(agentId)`
- `getTotalLeads()`

## Using Services

### In Components
```javascript
import { formService } from '../services';

const FormsPage = () => {
  const [forms, setForms] = useState([]);

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await formService.getAll({ page: 1, limit: 10 });
        setForms(response.data.forms);
      } catch (error) {
        console.error('Failed to fetch forms:', error);
      }
    };

    fetchForms();
  }, []);

  return <div>...</div>;
};
```

### With Redux
```javascript
import { formService } from '../services';

// In Redux thunk
export const fetchForms = () => async (dispatch) => {
  try {
    dispatch({ type: 'FETCH_FORMS_REQUEST' });
    const response = await formService.getAll();
    dispatch({ type: 'FETCH_FORMS_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'FETCH_FORMS_FAILURE', payload: error });
  }
};
```

## API Endpoints

All new endpoints use `/api` prefix:

### Authentication
-`POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Users
- `GET /api/users` - All users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user

### Hospitals
- `GET /api/hospitals` - All hospitals
- `POST /api/hospitals` - Create hospital
- `POST /api/hospitals/:id/branches` - Add branch

### Forms
- `GET /api/forms` - All forms
- `POST /api/forms` - Submit form
- `GET /api/forms/stats/agent/:agentId/dashboard` - Stats

## Environment Variables

Create `.env` file:
```
VITE_API_URL=http://localhost:5000
```

## State Management

### Redux (Keep)
Used for complex global state:
- Hospital data
- User lists
- Form data
- Application-wide state

### Context API
Used for simpler state:
- Theme mode
- Current user auth
- UI state

## Best Practices

1. **Always use services** for API calls
2. **Never call axios directly** in components
3. **Handle errors** in try-catch blocks
4. **Use loading states** for async operations
5. **Use Redux** for complex state
6. **Use Context** for simple state

## Migration Notes

### What's New:
-  Services layer for API calls
-  Centralized axios configuration
-  Auto token management
-  Global  error handling

### Next Steps:
1. Migrate all API calls to use services
2. Remove direct axios/fetch calls from components
3. Update routes to use new `/api/*` endpoints
4. Organize components into `/common`, `/charts`, `/forms`
5. Move pages from `/scenes` to `/pages`

## Summary

This architecture provides:
- **Clean separation** between API and UI
- **Reusable services**
- **Consistent patterns**
- **Easy to test and maintain**
- **Production-ready**
