# Backend routes docs

This document details the available endpoints for the user management system, including request/response structures, authentication requirements, and validation rules.

**Base URL:** `/api/v1`

---

# User routes

### 1. Register a New User

- **Endpoint:** `/user/register`
- **Method:** `POST`
- **Authentication:** No
- **Request Body:**

  | Parameter     | Type     | Required | Description                     |
  | :------------ | :------- | :------- | :------------------------------ |
  | `userName`    | `string` | Yes      | Username (6-64 characters)      |
  | `password`    | `string` | Yes      | Password (12-128 characters)    |
  | `displayName` | `string` | No       | Display name (1-128 characters) |

- **Response:**
  - **201 Created:** "User registered successfully"
  - **400 Bad Request:** Array of validation errors.
  - **409 Conflict:** User with this username already exists.

---

### 2. Get Current User Information

- **Endpoint:** `/user/me`
- **Method:** `GET`
- **Authentication:** Yes (JWT)
- **Request:** None
- **Response:**
  - **200 OK:** User object with `id`, `userName`, `displayName`, and `createdAt` properties.
  - **404 Not Found:** User not found or inactive.

---

### 3. Update Current User Information

- **Endpoint:** `/user/me`
- **Method:** `PATCH`
- **Authentication:** Yes (JWT)
- **Request Body:** (Any of the following are optional; at least one should be provided)

  | Parameter     | Type     | Required | Description                             |
  | :------------ | :------- | :------- | :-------------------------------------- |
  | `displayName` | `string` | No       | Updated display name (1-128 characters) |
  | `password`    | `string` | No       | New password (12-128 characters)        |
  | `userName`    | `string` | No       | New username (6-64 characters)          |

- **Response:**
  - **200 OK:** Updated user object with fields: `id`, `userName`, `displayName`, and `createdAt`.
  - **400 Bad Request:** Array of validation errors.
  - **404 Not Found:** User not found or inactive.
  - **409 Conflict:** Another user already exists with the new username.

---

### 4. Delete Current User Account

- **Endpoint:** `/user/me`
- **Method:** `DELETE`
- **Authentication:** Yes (JWT)
- **Request:** None
- **Response:**
  - **200 OK:** (empty body) - Account successfully deactivated.
  - **404 Not Found:** User not found or inactive.
  - **500 Internal Server Error:** Error during deletion.

---

### 5. Get Users List

- **Endpoint:** `/users`
- **Method:** `GET`
- **Authentication:** Yes (JWT)
- **Query Parameters:**

  | Parameter | Type     | Required | Default | Description                      |
  | :-------- | :------- | :------- | :------ | :------------------------------- |
  | `page`    | `number` | No       | 1       | Page number for pagination.      |
  | `limit`   | `number` | No       | 15      | Number of items per page (1-50). |

- **Response:**
  - **200 OK:**
    ```json
    {
      "pagination": {
        "previous": { "page": "number", "limit": "number" },
        "next": { "page": "number", "limit": "number" }
      },
      "items": [
        {
          "id": "string",
          "userName": "string",
          "displayName": "string",
          "createdAt": "string"
        }
        // ... more user objects
      ]
    }
    ```
  - **400 Bad Request:** Array of validation errors.
  - **404 Not Found:** No users found.
  - **500 Internal Server Error:** Server error.

---

### 6. Get User by Username

- **Endpoint:** `/user/:userName`
- **Method:** `GET`
- **Authentication:** Yes (JWT)
- **Parameters:**
  - `userName` (path parameter): The username of the user to retrieve.
- **Response:**
  - **200 OK:** User object with `id`, `userName`, `displayName`, and `createdAt`.
  - **404 Not Found:** User not found or inactive.

---

### 7. Get User by User ID

- **Endpoint:** `/user/id/:userId`
- **Method:** `GET`
- **Authentication:** Yes (JWT)
- **Parameters:**
  - `userId` (path parameter): The ID of the user to retrieve.
- **Response:**
  - **200 OK:** User object with `id`, `userName`, `displayName`, and `createdAt`.
  - **404 Not Found:** User not found or inactive.
  - **500 Internal Server Error:** Server error.

---

# Auth route

### 1. Authenticate User

- **Endpoint:** `/auth`
- **Method:** `POST`
- **Authentication:** No
- **Request Body:**

  | Parameter  | Type     | Required | Description                  |
  | :--------- | :------- | :------- | :--------------------------- |
  | `userName` | `string` | Yes      | Username (6-64 characters)   |
  | `password` | `string` | Yes      | Password (12-128 characters) |

- **Response:**
  - **200 OK:**
    ```json
    {
      "message": "Authentication successful",
      "token": "string" // JWT token
    }
    ```
  - **400 Bad Request:** Array of validation errors.
  - **401 Unauthorized:** Invalid username or password.

---

# Post routes

### 1. Create a New Post

- **Endpoint:** `/post/create`
- **Method:** `POST`
- **Authentication:** Yes (JWT)
- **Request Body:**

  | Parameter | Type     | Required | Description                |
  | :-------- | :------- | :------- | :------------------------- |
  | `title`   | `string` | Yes      | Post title (1-64 chars)    |
  | `content` | `string` | Yes      | Post content (1-255 chars) |

- **Response:**
  - **201 Created:** Returns the created post with `id`, `title`, `content`, `createdAt`, and `lastEdited`.
  - **400 Bad Request:** Array of validation errors.
  - **409 Conflict:** Issue saving the post.

---

### 2. Get All Posts (Paginated)

- **Endpoint:** `/posts`
- **Method:** `GET`
- **Authentication:** Yes (JWT)
- **Optional Query / Filter Parameters:**

  - `userId` (optional) — filter posts by a specific user
  - `page` (optional) — default 1
  - `limit` (optional, 1-50) — default 15

- **Response:**
  - **200 OK:**
    ```json
    {
      "pagination": {
        "previous": { "page": "number", "limit": "number" },
        "next": { "page": "number", "limit": "number" }
      },
      "items": [
        {
          "id": "string",
          "title": "string",
          "content": "string",
          "createdAt": "string",
          "lastEdited": "string",
          "user": {
            "userName": "string",
            "displayName": "string"
          }
        }
      ]
    }
    ```
  - **400 Bad Request:** Array of validation errors.
  - **404 Not Found:** No posts found.
  - **500 Internal Server Error:** An unexpected error occurred.

---

### 3. Get a Single Post by ID

- **Endpoint:** `/post/:postId`
- **Method:** `GET`
- **Authentication:** Yes (JWT)
- **Path Parameters:**
  - `postId`: Valid UUID of the post.
- **Response:**
  - **200 OK:** Post object (includes associated `user` with `userName` and `displayName`).
  - **400 Bad Request:** Array of validation errors.
  - **404 Not Found:** Post not found.
  - **500 Internal Server Error:** An unexpected error occurred.

---

### 4. Update a Post by ID

- **Endpoint:** `/post/:postId`
- **Method:** `PATCH`
- **Authentication:** Yes (JWT)
- **Path Parameters:**
  - `postId`: Valid UUID of the post.
- **Request Body:** (Optional fields)

  - `title`: (Optional) Updated post title (1-64 chars).
  - `content`: (Optional) Updated post content (1-255 chars).

- **Response:**
  - **200 OK:** Updated post object with `id`, `title`, `content`, `createdAt`, and `lastEdited`.
  - **400 Bad Request:** Array of validation errors.
  - **403 Forbidden:** User not authorized to update the post.
  - **404 Not Found:** Post not found.
  - **500 Internal Server Error:** An unexpected error occurred.

---

### 5. Delete a Post by ID

- **Endpoint:** `/post/:postId`
- **Method:** `DELETE`
- **Authentication:** Yes (JWT)
- **Path Parameters:**
  - `postId`: Valid UUID of the post.
- **Response:**
  - **200 OK:** Successful deletion (soft-delete / deactivate).
  - **400 Bad Request:** Array of validation errors.
  - **403 Forbidden:** User not authorized to delete the post.
  - **404 Not Found:** Post not found.
  - **500 Internal Server Error:** An unexpected error occurred.

---

# Comment routes

### 1. Create a New Comment

- **Endpoint:** `/comment/:postId`
- **Method:** `POST`
- **Authentication:** Yes (JWT)
- **Path Parameters:**
  - `postId`: Valid UUID of the post.
- **Request Body:**

  | Parameter | Type     | Required | Description                   |
  | :-------- | :------- | :------- | :---------------------------- |
  | `content` | `string` | Yes      | Comment content (1-255 chars) |

- **Response:**
  - **201 Created:** New comment object with `id`, `content`, `postId`, `userId`, `createdAt`, and `lastEdited`.
  - **400 Bad Request:** Array of validation errors.
  - **500 Internal Server Error:** An unexpected error occurred.

---

### 2. Get Comments for a Post (Paginated)

- **Endpoint:** `/comments/:postId`
- **Method:** `GET`
- **Authentication:** Yes (JWT)
- **Path Parameters:**
  - `postId`: Valid UUID of the post.
- **Query Parameters:**
  - `page`: (Optional) Page number (numeric, min 1)
  - `limit`: (Optional) Number of comments per page (numeric, min 1, max 50)
- **Response:**
  - **200 OK:**
    ```json
    {
      "pagination": {
        "previous": { "page": "number", "limit": "number" },
        "next": { "page": "number", "limit": "number" }
      },
      "comments": [
        {
          "id": "string",
          "content": "string",
          "postId": "string",
          "userId": "string",
          "createdAt": "string",
          "lastEdited": "string",
          "user": {
            "userName": "string",
            "displayName": "string"
          }
        }
      ]
    }
    ```
  - **400 Bad Request:** Array of validation errors.
  - **404 Not Found:** No comments found for the post.
  - **500 Internal Server Error:** An unexpected error occurred.

---

### 3. Delete a Comment

- **Endpoint:** `/comment/:commentId`
- **Method:** `DELETE`
- **Authentication:** Yes (JWT)
- **Path Parameters:**
  - `commentId`: Valid UUID of the comment.
- **Response:**
  - **200 OK:** Successful deletion (soft-delete / deactivate).
  - **404 Not Found:** Comment not found or user does not have permission to delete.
  - **500 Internal Server Error:** An unexpected error occurred.

---

### 4. Update a Comment

- **Endpoint:** `/comment/:commentId`
- **Method:** `PATCH`
- **Authentication:** Yes (JWT)
- **Path Parameters:**
  - `commentId`: Valid UUID of the comment.
- **Request Body:**

  | Parameter | Type     | Required | Description                           |
  | :-------- | :------- | :------- | :------------------------------------ |
  | `content` | `string` | Yes      | Updated comment content (1-255 chars) |

- **Response:**
  - **200 OK:** Updated comment object with `id`, `content`, `postId`, `userId`, `createdAt`, and `lastEdited`.
  - **404 Not Found:** Comment not found or user not authorized to update.
  - **500 Internal Server Error:** An unexpected error occurred.

---

### 5. Get a Comment by ID

- **Endpoint:** `/comment/:commentId`
- **Method:** `GET`
- **Authentication:** Yes (JWT)
- **Path Parameters:**
  - `commentId`: Valid UUID of the comment.
- **Response:**
  - **200 OK:** Comment object with `id`, `content`, `postId`, `userId`, `createdAt`, and `lastEdited`.
  - **404 Not Found:** Comment not found.
  - **500 Internal Server Error:** An unexpected error occurred.

---
