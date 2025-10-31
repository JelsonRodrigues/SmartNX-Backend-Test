# Database Schema Documentation

This document details the schema for the application's database, outlining each table's structure, fields, and relationships.

## Overview

The database consists of three main tables: `User`, `Post`, and `Comment`. These tables are designed to represent users, posts created by users, and comments made on those posts.  Relationships are established to link users to their posts and comments, and posts to their comments.

## Table Details

### 1. User Table

*   **Name:** `User`
*   **Description:** Stores user account information.

| Field         | Data Type       | Constraints      | Description                                |
| :------------ | :-------------- | :--------------- | :----------------------------------------- |
| `id`          | `UUID`          | Primary Key, Default: `UUIDV4` | Unique identifier for the user.         |
| `display_name`| `STRING`        |                   | User's preferred display name.            |
| `user_name`   | `STRING`        | Unique, Not Null | User's unique username.                   |
| `password`    | `STRING(64)`    | Not Null         | User's password (hashed).                 |
| `is_active`   | `BOOLEAN`       | Default: `true`  | Indicates if the user account is active. |

### 2. Post Table

*   **Name:** `Post`
*   **Description:** Stores posts created by users.

| Field         | Data Type       | Constraints      | Description                                 |
| :------------ | :-------------- | :--------------- | :------------------------------------------ |
| `id`          | `UUID`          | Primary Key, Default: `UUIDV4` | Unique identifier for the post.          |
| `title`       | `STRING(64)`    | Not Null         | The title of the post.                      |
| `content`     | `STRING`        | Not Null         | The content of the post.                    |
| `last_edited` | `TIME`          |                   | Timestamp of the last modification.        |
| `is_active`   | `BOOLEAN`       | Default: `true`  | Indicates if the post is active.          |
| `user_id`     | `UUID`          | Foreign Key (User) |  Links the post to the authoring user. |

### 3. Comment Table

*   **Name:** `Comment`
*   **Description:** Stores comments made on posts.

| Field         | Data Type       | Constraints      | Description                                |
| :------------ | :-------------- | :--------------- | :----------------------------------------- |
| `id`          | `UUID`          | Primary Key, Default: `UUIDV4` | Unique identifier for the comment.       |
| `content`     | `STRING`        | Not Null         | The content of the comment.               |
| `is_active`   | `BOOLEAN`       | Default: `true`  | Indicates if the comment is active.       |
| `last_edited` | `TIME`          |                   | Timestamp of the last modification.       |
| `post_id`     | `UUID`          | Foreign Key (Post) | Links the comment to the associated post. |
| `user_id`     | `UUID`          | Foreign Key (User) | Links the comment to the authoring user. |

## Relationships

*   **One-to-Many: User to Post** - A user can create multiple posts.  Posts belong to a single user.
*   **One-to-Many: Post to Comment** - A post can have multiple comments. Comments belong to a single post.
*   **One-to-Many: User to Comment** - A user can create multiple comments. Comments belong to a single user.
