# Book Recommendation Social Media

CodePath WEB103 Final Project

Designed and developed by: Aisha Salimgereyeva, Sahrish Afzal, Maryam Nisar

🔗 Link to deployed app: <a href="https://readup-production.up.railway.app/">LINK</a>

## About

https://github.com/user-attachments/assets/f140ea01-590a-4645-81f6-0ee9cec62df4

https://github.com/user-attachments/assets/22fccd8f-53c0-4405-8e60-0d8c6a9c76ef

https://github.com/user-attachments/assets/afc7436c-ee5b-4071-9b82-f3b1df46d629

### Description and Purpose

This project is a book recommendation social media platform, similar to Goodreads. Users can explore a preloaded database of books, share their reviews, and mark which books they have read or plan to read. It is also planned to add AI implementation in the project.

### Inspiration

Inspired by the desire to create a community-driven platform for book lovers, this project aims to enhance the reading experience by connecting readers and allowing them to track their reading progress. Find new, exciting books.

## Tech Stack

**Frontend:** React, Material-UI (MUI), Vite

**Backend:** Express, PostgreSQL

# Features List

## Baseline Features

- [x] **Backend:**
  - [x] Set up Express backend and connect to PostgreSQL database.
  - [x] Implement database relationships:
    - [x] One-to-many: Users and Book Reviews (one user can have many reviews).
    - [x] Many-to-many: Users and Upvotes (many users can have many upvotes).

https://github.com/user-attachments/assets/4be66fc3-71c2-4900-8e15-5529144e12f3

- [x] RESTful API with proper route naming:
  - [x] **GET**: Retrieve books, reviews, and user information.
  - [x] **POST**: Add a new review, save a book to a user’s list.
  - [x] **PATCH**: Update a book review or user profile.
  - [x] **DELETE**: Remove a saved book from a list or delete a review.

https://github.com/user-attachments/assets/90e8c85b-8f59-4340-bbe9-9980cef5f4ce

- [x] Ability to reset the database to its default state.

https://github.com/user-attachments/assets/defbb362-32f9-42be-8487-6b24cea1b6d2

- [x] **Frontend:**
  - [x] Set up React frontend with dynamic routes using React Router.

https://github.com/user-attachments/assets/8abeece6-0c42-4457-bca8-62a2c683d9ad

- [x] Implement hierarchically designed components with containers and presentational components:

  - [x] **Page Components**: Home, Dashboard, Book Details, Saved Books, Review Pages.
  - [x] **Component Types**: Review component, Book Card, List components.

  <img width="264" alt="Screenshot 2024-11-05 at 12 16 00 PM" src="https://github.com/user-attachments/assets/62d28e9b-bcb9-4ce6-88ad-5730a6172864">

https://github.com/user-attachments/assets/24c1cd1c-fe4c-4dae-9a2e-e563a319c30f

- [x] Redirection: Implement user redirection (e.g., after submitting a review).
- [x] Interactive elements: Allow users to add reviews and save books without navigating to a new page.

https://github.com/user-attachments/assets/c16a7166-f08d-4863-a886-9501ba2d6501

- [x] Deploy the app on Railway, ensuring all features and pages work.

## Custom Features

- [x] **Error Handling**: Implement error messages for actions like failed API calls or invalid form submissions.

https://github.com/user-attachments/assets/ba2dfa6c-2680-417b-a646-978584a7928d

- [x] **One-to-One Database Relationship**: Link each user to a profile that stores their preferences and AI recommendation data.
- [x] **Data Validation**: Validate user input (e.g., review text) before updating the database.

https://github.com/user-attachments/assets/2b40b61e-975a-43c2-8b3e-326bba60743d

## Additional Custom Features

- [x] **Authentication with Clerk**:
  - [x] Use Clerk for authentication with **Google** and **GitHub** OAuth options.
  - [x] Require users to log in to access the dashboard and save books.

https://github.com/user-attachments/assets/577688d7-fb76-4fc7-8f93-c9f305b1ab3d

- [x] **NYT and Google Books API**:
  - [x] Integrate the **New York Times Bestsellers API** for a feed of bestselling books on the home page.
  - [x] Integrate the **Google Books API** for book search functionality, allowing users to search for books by title or author.

https://github.com/user-attachments/assets/0a170db2-be50-41d8-9476-d7c21f9c3ab7

- [x] **Dashboard Features**:
  - [x] **Bestsellers Feed**: Display a list of bestselling books from the NYT API.
  - [x] **Top Review Books**: Show a feed of books with the most reviews from users.
  - [x] **Saved Books**: Display the user's saved books on their dashboard.

https://github.com/user-attachments/assets/77563a21-a56f-442a-b06f-5fad914d0b90

https://github.com/user-attachments/assets/d76dfdb9-b3b0-4efc-84e9-ef9f9f62c0e2

- [ ] **AI Recommendations**:

  - [ ] Based on the user’s reading history, generate book recommendations using AI.
  - [ ] Display AI-recommended books on the user’s dashboard.

- [x] **Clipped Books**:
  - [x] Allow users to clip books to different custom lists (e.g., "Want to Read," "Read").

https://github.com/user-attachments/assets/656bb053-2050-4f2a-ad45-e156f97c7fe1

## Stretch Features

- [x] **Image Upload**: Allow users to upload a profile picture.

https://github.com/user-attachments/assets/f53b924a-3aef-4e98-a88f-32d712a2a389

- [x] **Spinners/Loading States**: Show a spinner while book data or reviews are being fetched.

https://github.com/user-attachments/assets/075d3484-ddb8-4112-b3bb-2a1fccc27ff6

- [x] **Button States**: Disable buttons during form submission to prevent multiple submissions.
- [x] **Toast Messages**: Provide feedback for user actions like saving a book or submitting a review with toast notifications.

https://github.com/user-attachments/assets/7ebc1978-2d2e-496f-b5fa-5c1168624197

## Installation Instructions

1.  download zip
2.  open it in vs code
3.  Run

> cd backend
> npm install

4.  Run

    > cd ..
    > cd frontend
    > npm install

5.  add .env file into backend

    > DB_USER=
    > DB_PASSWORD=
    > DB_HOST=
    > DB_PORT=
    > DB_NAME=
    > NYT_BOOKS_API_KEY=
    > GOOGLE_BOOKS_API_KEY=
    > CLERK_PUBLISHABLE_KEY=
    > CLERK_SECRET_KEY=

6.  add .env file into frontend

    > VITE_CLERK_PUBLISHABLE_KEY=
    > CLERK_SECRET_KEY=
    > GOOGLE_BOOKS_API_KEY=

7.  in the terminal:

> cd backend
> npm install morgan
> npm start

7.  open other terminal to run frontend:

> cd frontend
> npm install @clerk/clerk-react
> npm install react-router-dom
> npm run dev
