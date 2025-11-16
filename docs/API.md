# Retro Tracker API Documentation

Complete API documentation for the Retro Tracker application backend endpoints.

## Table of Contents

- [Base Configuration](#base-configuration)
- [Authentication](#authentication)
- [Teams](#teams)
- [Retrospectives](#retrospectives)
- [Cards](#cards)
- [Error Handling](#error-handling)

---

## Base Configuration

### Base URL

```
Default: http://localhost:3000/api
Configurable via: VITE_API_URL environment variable
```

### Headers

All requests include the following headers:

```http
Content-Type: application/json
```

For authenticated requests, include the Bearer token:

```http
Authorization: Bearer <token>
```

The token is automatically added from `localStorage.getItem('token')` by the API client.

### Response Format

All successful API responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

### Paginated Response Format

For endpoints that return paginated data:

```typescript
interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
  };
}
```

---

## Authentication

### POST /auth/login

Authenticate a user and receive a JWT token.

**Authentication:** Not required

**Request Body:**

```typescript
interface LoginCredentials {
  email: string;
  password: string;
}
```

**Example Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`

```typescript
ApiResponse<AuthResponse>

interface AuthResponse {
  token: string;
  user: User;
}

interface User {
  _id: string;
  name: string;
  email: string;
  avatarInitials?: string;
  createdAt: string;
  updatedAt: string;
}
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "avatarInitials": "JD",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Login successful"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid email or password format
- `401 Unauthorized` - Invalid credentials

---

### POST /auth/register

Register a new user account.

**Authentication:** Not required

**Request Body:**

```typescript
interface RegisterData {
  name: string;
  email: string;
  password: string;
}
```

**Example Request:**

```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`

```typescript
ApiResponse<AuthResponse>
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "avatarInitials": "JD",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Account created successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Validation error (email already exists, invalid format, etc.)
- `409 Conflict` - Email already registered

---

### GET /auth/me

Get the current authenticated user's information.

**Authentication:** Required (Bearer token)

**Response:** `200 OK`

```typescript
ApiResponse<User>
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com",
    "avatarInitials": "JD",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Invalid or expired token

**Note:** This endpoint is used by `AuthContext` on app initialization to verify token validity.

---

## Teams

### GET /teams

Get all teams the current user is a member of.

**Authentication:** Required

**Response:** `200 OK`

```typescript
ApiResponse<Team[]>

interface Team {
  _id: string;
  id: string; // Alias for _id
  name: string;
  description?: string;
  createdBy: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  joinedAt: string;
}
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "id": "507f1f77bcf86cd799439011",
      "name": "Engineering Team",
      "description": "Main engineering team",
      "createdBy": "507f191e810c19729de860ea",
      "members": [
        {
          "userId": "507f191e810c19729de860ea",
          "name": "John Doe",
          "email": "john@example.com",
          "role": "admin",
          "joinedAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET /teams/:teamId

Get details of a specific team.

**Authentication:** Required

**Path Parameters:**

- `teamId` (string, required) - The team ID

**Response:** `200 OK`

```typescript
ApiResponse<Team>
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "id": "507f1f77bcf86cd799439011",
    "name": "Engineering Team",
    "description": "Main engineering team",
    "createdBy": "507f191e810c19729de860ea",
    "members": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `404 Not Found` - Team not found
- `403 Forbidden` - User is not a member of the team

---

### GET /teams/:teamId/members

Get all members of a specific team.

**Authentication:** Required

**Path Parameters:**

- `teamId` (string, required) - The team ID

**Response:** `200 OK`

```typescript
ApiResponse<TeamMember[]>
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "userId": "507f191e810c19729de860ea",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "joinedAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "userId": "507f191e810c19729de860eb",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "member",
      "joinedAt": "2024-01-02T00:00:00.000Z"
    }
  ]
}
```

---

### POST /teams

Create a new team.

**Authentication:** Required

**Request Body:**

```typescript
interface CreateTeamData {
  name: string;
  description?: string;
}
```

**Example Request:**

```json
{
  "name": "Engineering Team",
  "description": "Main engineering team"
}
```

**Response:** `201 Created`

```typescript
ApiResponse<Team>
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "id": "507f1f77bcf86cd799439011",
    "name": "Engineering Team",
    "description": "Main engineering team",
    "createdBy": "507f191e810c19729de860ea",
    "members": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Team created successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Validation error (name required, etc.)

---

### POST /teams/:teamId/invite

Invite a member to join a team.

**Authentication:** Required (must be team admin)

**Path Parameters:**

- `teamId` (string, required) - The team ID

**Request Body:**

```typescript
interface InviteMemberData {
  email: string;
  role?: 'admin' | 'member'; // Default: 'member'
}
```

**Example Request:**

```json
{
  "email": "newmember@example.com",
  "role": "member"
}
```

**Response:** `201 Created`

```typescript
ApiResponse<TeamMember>
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "userId": "507f191e810c19729de860eb",
    "name": "New Member",
    "email": "newmember@example.com",
    "role": "member",
    "joinedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Member invited successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid email or user not found
- `403 Forbidden` - User is not an admin of the team
- `409 Conflict` - User is already a member

---

### DELETE /teams/:teamId/members/:memberId

Remove a member from a team.

**Authentication:** Required (must be team admin)

**Path Parameters:**

- `teamId` (string, required) - The team ID
- `memberId` (string, required) - The member's user ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

**Error Responses:**

- `403 Forbidden` - User is not an admin of the team
- `404 Not Found` - Member not found in team

---

## Retrospectives

### GET /teams/:teamId/retros

Get all retrospectives for a team with optional filtering.

**Authentication:** Required

**Path Parameters:**

- `teamId` (string, required) - The team ID

**Query Parameters:**

- `search` (string, optional) - Search term for retro name
- `startDate` (string, optional) - Filter retros from this date (ISO 8601)
- `endDate` (string, optional) - Filter retros until this date (ISO 8601)
- `page` (number, optional) - Page number for pagination (default: 1)
- `limit` (number, optional) - Items per page (default: 10)

**Example Request:**

```
GET /teams/507f1f77bcf86cd799439011/retros?search=sprint&startDate=2024-01-01&endDate=2024-12-31
```

**Response:** `200 OK`

```typescript
PaginatedResponse<Retro>

interface Retrospective {
  _id: string;
  id: string; // Alias for _id
  name: string;
  teamId: string;
  status: 'active' | 'completed' | 'archived';
  sprintNumber?: number;
  startDate?: string;
  endDate?: string;
  createdBy: {
    _id: string;
    name: string;
  };
  cardCount?: {
    wentWell: number;
    needsImprovement: number;
    kudos: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "id": "507f1f77bcf86cd799439012",
        "name": "Sprint 1 Retrospective",
        "teamId": "507f1f77bcf86cd799439011",
        "status": "active",
        "sprintNumber": 1,
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-01-14T00:00:00.000Z",
        "createdBy": {
          "_id": "507f191e810c19729de860ea",
          "name": "John Doe"
        },
        "cardCount": {
          "wentWell": 5,
          "needsImprovement": 3,
          "kudos": 2
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

---

### GET /retros/:retroId

Get details of a specific retrospective.

**Authentication:** Required

**Path Parameters:**

- `retroId` (string, required) - The retrospective ID

**Response:** `200 OK`

```typescript
ApiResponse<Retro>
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "id": "507f1f77bcf86cd799439012",
    "name": "Sprint 1 Retrospective",
    "teamId": "507f1f77bcf86cd799439011",
    "status": "active",
    "sprintNumber": 1,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-14T00:00:00.000Z",
    "createdBy": {
      "_id": "507f191e810c19729de860ea",
      "name": "John Doe"
    },
    "cardCount": {
      "wentWell": 5,
      "needsImprovement": 3,
      "kudos": 2
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `404 Not Found` - Retrospective not found
- `403 Forbidden` - User is not a member of the team

---

### POST /teams/:teamId/retros

Create a new retrospective for a team.

**Authentication:** Required (must be team member)

**Path Parameters:**

- `teamId` (string, required) - The team ID

**Request Body:**

```typescript
interface CreateRetroData {
  name: string;
  sprintNumber?: number;
  startDate?: string; // ISO 8601 date string
  endDate?: string; // ISO 8601 date string
}
```

**Example Request:**

```json
{
  "name": "Sprint 1 Retrospective",
  "sprintNumber": 1,
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-14T00:00:00.000Z"
}
```

**Response:** `201 Created`

```typescript
ApiResponse<Retro>
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "id": "507f1f77bcf86cd799439012",
    "name": "Sprint 1 Retrospective",
    "teamId": "507f1f77bcf86cd799439011",
    "status": "active",
    "sprintNumber": 1,
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-14T00:00:00.000Z",
    "createdBy": {
      "_id": "507f191e810c19729de860ea",
      "name": "John Doe"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Retrospective created successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Validation error
- `403 Forbidden` - User is not a member of the team

---

### DELETE /retros/:retroId

Delete a retrospective.

**Authentication:** Required (must be team member or admin)

**Path Parameters:**

- `retroId` (string, required) - The retrospective ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Retrospective deleted successfully"
}
```

**Error Responses:**

- `404 Not Found` - Retrospective not found
- `403 Forbidden` - User does not have permission

---

## Cards

### GET /retros/:retroId/cards

Get all cards for a specific retrospective.

**Authentication:** Required (must be team member)

**Path Parameters:**

- `retroId` (string, required) - The retrospective ID

**Response:** `200 OK`

```typescript
ApiResponse<Card[]>

interface Card {
  _id: string;
  id: string; // Alias for _id
  retroId: string;
  type: 'went_well' | 'needs_improvement' | 'kudos';
  content: string;
  author: string;
  authorName: string;
  votes: string[]; // Array of user IDs who voted
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "id": "507f1f77bcf86cd799439013",
      "retroId": "507f1f77bcf86cd799439012",
      "type": "went_well",
      "content": "We delivered the sprint goals on time",
      "author": "507f191e810c19729de860ea",
      "authorName": "John Doe",
      "votes": ["507f191e810c19729de860eb"],
      "isDeleted": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Note:** Soft-deleted cards may be filtered out on the frontend based on `isDeleted` flag.

---

### POST /retros/:retroId/cards

Create a new card in a retrospective.

**Authentication:** Required (must be team member)

**Path Parameters:**

- `retroId` (string, required) - The retrospective ID

**Request Body:**

```typescript
interface CreateCardData {
  type: 'went_well' | 'needs_improvement' | 'kudos';
  content: string;
}
```

**Example Request:**

```json
{
  "type": "went_well",
  "content": "We delivered the sprint goals on time"
}
```

**Response:** `201 Created`

```typescript
ApiResponse<Card>
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "id": "507f1f77bcf86cd799439013",
    "retroId": "507f1f77bcf86cd799439012",
    "type": "went_well",
    "content": "We delivered the sprint goals on time",
    "author": "507f191e810c19729de860ea",
    "authorName": "John Doe",
    "votes": [],
    "isDeleted": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Card created successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Validation error (invalid type, empty content, etc.)
- `403 Forbidden` - User is not a member of the team
- `404 Not Found` - Retrospective not found

---

### PUT /cards/:cardId

Update an existing card (content or votes).

**Authentication:** Required (must be team member)

**Path Parameters:**

- `cardId` (string, required) - The card ID

**Request Body:**

```typescript
interface UpdateCardData {
  content?: string;
  votes?: string[]; // Array of user IDs who voted
}
```

**Example Request:**

```json
{
  "content": "Updated content",
  "votes": ["507f191e810c19729de860ea", "507f191e810c19729de860eb"]
}
```

**Response:** `200 OK`

```typescript
ApiResponse<Card>
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "id": "507f1f77bcf86cd799439013",
    "retroId": "507f1f77bcf86cd799439012",
    "type": "went_well",
    "content": "Updated content",
    "author": "507f191e810c19729de860ea",
    "authorName": "John Doe",
    "votes": ["507f191e810c19729de860ea", "507f191e810c19729de860eb"],
    "isDeleted": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z"
  },
  "message": "Card updated successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Validation error
- `403 Forbidden` - User does not have permission
- `404 Not Found` - Card not found

**Note:** Only the card author can update content. Any team member can update votes.

---

### DELETE /cards/:cardId

Delete a card (soft delete).

**Authentication:** Required (must be card author or team admin)

**Path Parameters:**

- `cardId` (string, required) - The card ID

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Card deleted successfully"
}
```

**Error Responses:**

- `403 Forbidden` - User does not have permission
- `404 Not Found` - Card not found

**Note:** This performs a soft delete, setting `isDeleted: true`. The card may still appear in responses but should be filtered on the frontend.

---

## Error Handling

### Standard Error Response

When an error occurs, the API returns an error response in the following format:

```typescript
{
  success: false,
  message: string, // Error message
  error?: any // Additional error details (development only)
}
```

### HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Validation error or invalid request
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User does not have permission
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., email already exists)
- `500 Internal Server Error` - Server error

### Authentication Errors

When a `401 Unauthorized` response is received, the frontend automatically:

1. Removes the token from `localStorage`
2. Redirects the user to `/login`
3. Displays an error message

This is handled by the response interceptor in `frontend/src/lib/api.ts`:

```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);
```

### Error Message Extraction

Error messages are extracted in the following priority:

1. `error.response?.data?.message` - API error message
2. `error.message` - Network/axios error message
3. `'An error occurred'` - Default fallback message

---

## TypeScript Types Reference

All TypeScript types are defined in `frontend/src/types/index.ts`. Key types include:

- `ApiResponse<T>` - Standard API response wrapper
- `PaginatedResponse<T>` - Paginated response wrapper
- `User` - User object
- `Team` - Team object
- `TeamMember` - Team member object
- `Retro` / `Retrospective` - Retrospective object
- `Card` - Card object
- `ActionItem` - Action item object (not yet implemented in frontend)
- `LoginCredentials` - Login request payload
- `RegisterData` - Registration request payload
- `CreateTeamData` - Create team request payload
- `InviteMemberData` - Invite member request payload
- `CreateRetroData` - Create retrospective request payload
- `CreateCardData` - Create card request payload
- `UpdateCardData` - Update card request payload

---

## Notes

1. **Token Storage:** The JWT token is stored in `localStorage` with the key `'token'` and is automatically included in all authenticated requests.

2. **ID Aliases:** Many response objects include both `_id` (MongoDB format) and `id` (for convenience). The frontend maps `_id` to `id` for easier use.

3. **Soft Deletes:** Cards use soft delete (setting `isDeleted: true`). The frontend should filter out deleted cards when displaying them.

4. **Voting:** Card votes are represented as an array of user IDs. To vote/unvote, send the complete array with the user's ID added or removed.

5. **Action Items:** Action item endpoints exist in the type definitions but are not yet implemented in the frontend hooks.

6. **Date Formats:** All dates are in ISO 8601 format (e.g., `"2024-01-01T00:00:00.000Z"`).

---

## Base URL Configuration

Set the API base URL using the `VITE_API_URL` environment variable:

```bash
# .env file
VITE_API_URL=http://localhost:3000/api
```

Default: `http://localhost:3000/api` (if not set)

---

*Last updated: Based on frontend codebase analysis*

