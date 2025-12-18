Core user journeys

1) Authentication

Implement sign up, sign in, and sign out.

Requirements
	•	Validate inputs (email format, password rules, required fields)
	•	Show clear error messages for invalid inputs and server failures
	•	Persist session so refresh keeps the user signed in
	•	You may choose any auth approach. A simple JWT (access token in httpOnly cookie) is acceptable. Managed auth like Keycloak is also acceptable.

Acceptance criteria
	•	A new user can register and then sign in
	•	A signed in user stays signed in after refresh
	•	A signed out user can no longer access protected endpoints or pages

2) Home screen

Show a list of items that belong to the currently signed in user.

Requirements
	•	Fetch the user’s items from the backend
	•	UI states: loading, empty list, error
	•	Pagination: page based pagination is enough (page and pageSize)

Acceptance criteria
	•	Only the signed in user’s items are visible
	•	UI clearly shows loading while fetching
	•	If there are zero items, show an empty state with a call to action to create an item
	•	If the request fails, show an error state with retry

3) Item management

Allow the signed in user to create, update, and delete their items.

Requirements
	•	CRUD endpoints on the backend
	•	Basic validation on create and update
	•	Confirm before delete (or provide undo)
	•	Each item can have a creative schema with multiple properties

Suggested item model (feel free to change)
	•	title: string (required)
	•	description: string (optional)
	•	status: enum(“todo”,“in_progress”,“done”)
	•	priority: enum(“low”,“medium”,“high”)
	•	createdAt, updatedAt

Acceptance criteria
	•	A user can create an item and see it appear in the list
	•	A user can edit an item and see updates reflected immediately
	•	A user can delete an item and it disappears from the list
	•	Users cannot access or modify other users’ items