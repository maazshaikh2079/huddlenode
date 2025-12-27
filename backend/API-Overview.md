### USERS API (Endpoint: /api/users)
- GET    /                   -> Get all registered users
- GET    /:userId            -> Get a specific user's public profile
- POST   /signup             -> Create a new account (accepts "pfp" image file)
- POST   /login              -> Authenticate user and return JWT token
- app.use(verifyJwt()) -> req.userData.userId ->
- PATCH  /edit/username      -> Update username (Auth Required)
- PATCH  /edit/pfp           -> Update profile picture (Auth Required, accepts "pfp" image file)

### FORUMS API (Endpoint: /api/forums)
- GET    /                   -> List all active forums
- GET    /:forumId           -> Get specific forum details
- app.use(verifyJwt()) -> req.userData.userId ->
- GET    /user               -> List forums created by current user (Auth Required)
- POST   /                   -> Create a new forum (Auth Required, accepts "coverImage" file)
- PATCH  /:forumId/edit/texts -> Update forum title/description (Auth Required)
- PATCH  /:forumId/edit/cover-image -> Update forum banner (Auth Required, accepts "coverImage" file)
- DELETE /:forumId           -> Force delete a forum (Auth Required)

### POSTS API (Endpoint: /api/posts)
- GET    /                   -> List all posts across all forums
- GET    /user               -> List posts created by current user (Auth Required)
- GET    /:postId            -> Get specific post details and content
- GET    /forum/:forumId     -> List all posts belonging to a specific forum
- app.use(verifyJwt()) -> req.userData.userId ->
- POST   /forum/:forumId     -> Create a new post (Auth Required, accepts "image" file)
- PATCH  /:postId/edit/texts -> Update post title/content (Auth Required)
- PATCH  /:postId/edit/image -> Update post image (Auth Required, accepts "image" file)
- DELETE /:postId            -> Delete a specific post (Auth Required)

### COMMENTS API (Endpoint: /api/comments)
- GET    /                   -> List all comments
- GET    /post/:postId       -> List all comments for a specific post
- app.use(verifyJwt()) -> req.userData.userId ->
- GET    /user               -> List comments made by current user (Auth Required)
- POST   /post/:postId       -> Create new comment (Auth Required, accepts optional "image" file)
- PATCH  /:commentId         -> Update comment text (Auth Required)
- DELETE /:commentId         -> Delete a specific comment (Auth Required)

---

## 🛡️ API Overview

HuddleNode provides a robust RESTful API. All routes requiring authentication expect a valid JWT in the `Authorization: Bearer <TOKEN>` header.

### **1. Authentication & Users** (`/api/users`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/signup` | ❌ | Create new account with an optional profile picture. |
| `POST` | `/login` | ❌ | Authenticate user and receive a JWT. |
| `GET` | `/:userId` | ❌ | Fetch public profile data for a specific user. |
| `PATCH` | `/edit/username` | ✅ | Update your display name. |
| `PATCH` | `/edit/pfp` | ✅ | Upload a new profile picture to Cloudinary. |

### **2. Forums** (`/api/forums`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | ❌ | Retrieve a list of all active communities. |
| `GET` | `/:forumId` | ❌ | Get detailed info for a specific forum. |
| `GET` | `/user` | ✅ | Retrieve all forums created by the authenticated user. |
| `POST` | `/` | ✅ | Create a new forum with a title, description, and cover image. |
| `PATCH` | `/:forumId/edit/texts` | ✅ | Update the title or description (Creator only). |
| `PATCH` | `/:forumId/edit/cover-image` | ✅ | Update the community banner (Creator only). |
| `DELETE` | `/:forumId` | ✅ | Permanently remove a forum and its contents. |

### **3. Posts** (`/api/posts`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/:postId` | ❌ | Fetch a specific post and its details. |
| `GET` | `/forum/:forumId` | ❌ | Get all posts belonging to a specific forum. |
| `POST` | `/forum/:forumId` | ✅ | Create a new post (supports optional image upload). |
| `PATCH` | `/:postId/edit/texts` | ✅ | Modify post title or content. |
| `PATCH` | `/:postId/edit/image` | ✅ | Replace the existing post image via Cloudinary. |
| `DELETE` | `/:postId` | ✅ | Delete a post (Creator only). |

### **4. Comments** (`/api/comments`)

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/post/:postId` | ❌ | Get the full discussion thread for a post. |
| `GET` | `/user` | ✅ | Fetch all comments made by the current user. |
| `POST` | `/post/:postId` | ✅ | Post a new comment (supports mixed text/image). |
| `PATCH` | `/:commentId` | ✅ | Edit existing comment text. |
| `DELETE` | `/:commentId` | ✅ | Remove a comment (Author only). |

---

## 🧪 Testing the API

You can test these endpoints using `curl` or by importing them into Postman. Replace `<TOKEN>` with the JWT received after a successful login or signup.

### **1. User Authentication**

**Signup a new user:**

```bash
curl -X POST http://localhost:5000/api/users/signup \
  -F "username=johndoe" \
  -F "email=john@example.com" \
  -F "password=strongpassword123" \
  -F "pfp=@/path/to/avatar.jpg"

```

*Note: This uses multipart/form-data for image uploads.*

**Login:**

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "strongpassword123"}'

```

---

### **2. Forums**

**Create a Forum (Auth Required):**

```bash
curl -X POST http://localhost:5000/api/forums/ \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=Mental Health Awareness" \
  -F "description=A safe space for support and discussion." \
  -F "coverImage=@/path/to/banner.png"

```

**Get All Forums:**

```bash
curl -X GET http://localhost:5000/api/forums/

```

---

### **3. Posts**

**Create a Post in a Forum (Auth Required):**

```bash
curl -X POST http://localhost:5000/api/posts/forum/:forumId \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=My First Post" \
  -F "content=This is some sample text for the post." \
  -F "image=@/path/to/image.jpg"

```

**Update Post Text:**

```bash
curl -X PATCH http://localhost:5000/api/posts/:postId/edit/texts \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'

```

---

### **4. Comments**

**Create a Comment on a Post (Auth Required):**

```bash
curl -X POST http://localhost:5000/api/comments/post/:postId \
  -H "Authorization: Bearer <TOKEN>" \
  -F "text=This is a helpful comment!" \
  -F "image=@/path/to/attachment.jpg"

```

**Edit a Comment:**

```bash
curl -X PATCH http://localhost:5000/api/comments/:commentId \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"text": "I edited my comment."}'

```

---

### **Common Troubleshooting**

* **401 Unauthorized**: Ensure your `Authorization` header is present and the token is valid.
* **404 Not Found**: Double-check that your IDs (`forumId`, `postId`, etc.) exist in the database.
* **422 Unprocessable Entity**: This usually means `express-validator` caught a missing required field (like a title that is too short).

---

## 🚀 Testing with Postman

### 1. Set Up Your Environment

To avoid re-typing URLs and tokens, create a new **Environment** in Postman and add these variables:

| Variable | Initial Value |
| --- | --- |
| `base_url` | `http://localhost:5000/api` |
| `token` | *(Leave empty - will be set after Login/Signup)* |


#### Copyable Environment JSON

You can copy this block, save it as `HuddleNode.postman_environment.json`, and import it directly into Postman.

```json
{
  "name": "HuddleNode - Template",
  "values": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api",
      "type": "default",
      "enabled": true
    },
    {
      "key": "token",
      "value": "",
      "type": "secret",
      "enabled": true
    }
  ],
  "_postman_variable_scope": "environment",
  "_postman_exported_at": "2025-12-27T12:00:00.000Z",
  "_postman_exported_using": "Postman/10.0.0"
}

```
---

### 2. Request Configuration Guide

#### **Authentication (No Token Required)**

* **Signup (`POST {{base_url}}/users/signup`)**
* **Body**: Select `form-data`.
* **Keys**: `username`, `email`, `password`, and `pfp` (change type to **File** for pfp).


* **Login (`POST {{base_url}}/users/login`)**
* **Body**: Select `raw` -> `JSON`.
* **Content**: `{"email": "user@example.com", "password": "password123"}`.



> **Tip**: In the Login request, go to the **Tests** tab and paste this to automatically update your token:
> ```javascript
> const response = pm.response.json();
> if (response.token) {
>     pm.environment.set("token", response.token);
> }
>
> ```
>
>

---

#### **Forums (Token Required for Writes)**

* **Create Forum (`POST {{base_url}}/forums/`)**
* **Headers**: `Authorization`: `Bearer {{token}}`.
* **Body**: `form-data` with `title`, `description`, and `coverImage` (File).


* **Edit Texts (`PATCH {{base_url}}/forums/:forumId/edit/texts`)**
* **Body**: `raw` -> `JSON`.
* **Content**: `{"title": "New Title", "description": "New description"}`.



---

#### **Posts & Comments (Token Required for Writes)**

* **Create Post (`POST {{base_url}}/posts/forum/:forumId`)**
* **Headers**: `Authorization`: `Bearer {{token}}`.
* **Body**: `form-data` with `title`, `content`, and `image` (File).


* **Add Comment (`POST {{base_url}}/comments/post/:postId`)**
* **Headers**: `Authorization`: `Bearer {{token}}`.
* **Body**: `form-data` with `text` and optional `image` (File).



---

### 3. Collection JSON (Copy & Import)

You can save the block below as `HuddleNode.postman_collection.json` and import it directly into Postman to have all folders and routes pre-configured.

```json
{
	"info": {
		"name": "HuddleNode API",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
	},
	"item": [
		{
			"name": "Users",
			"item": [
				{
					"name": "Login",
					"request": {
						"method": "POST",
						"header": [],
						"body": {
							"mode": "raw",
							"raw": "{\n    \"email\": \"test@example.com\",\n    \"password\": \"password123\"\n}",
							"options": { "json": { "language": "json" } }
						},
						"url": { "raw": "{{base_url}}/users/login" }
					}
				}
			]
		},
		{
			"name": "Forums",
			"item": [
				{
					"name": "Get All Forums",
					"request": {
						"method": "GET",
						"url": { "raw": "{{base_url}}/forums" }
					}
				}
			]
		}
	],
	"auth": {
		"type": "bearer",
		"bearer": [
			{
				"key": "token",
				"value": "{{token}}",
				"type": "string"
			}
		]
	}
}

```
