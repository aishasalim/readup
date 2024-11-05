
# Book Recommendation Social Media

  

CodePath WEB103 Final Project

  

Designed and developed by: Aisha Salimgereyeva, Sahrish Afzal, Maryam Nisar

  

🔗 Link to deployed app:

  

## About

  [![YouTube Video](https://img.youtube.com/vi/CQt7erndSao/0.jpg)](https://youtu.be/CQt7erndSao)


### Description and Purpose

  

This project is a book recommendation social media platform, similar to Goodreads. Users can explore a preloaded database of books, share their reviews, and mark which books they have read or plan to read. It is also planned to add AI implementation in the project. 

  

### Inspiration

  

Inspired by the desire to create a community-driven platform for book lovers, this project aims to enhance the reading experience by connecting readers and allowing them to track their reading progress. Find new, exciting books.

  

## Tech Stack

  

**Frontend:** React, Material-UI (MUI), Vite

  

**Backend:** Express, PostgreSQL

  

# Features List

## Baseline Features
- [X] **Backend:**
  - [x] Set up Express backend and connect to PostgreSQL database.
  - [x] Implement database relationships:
    - [X] One-to-many: Users and Book Reviews (one user can have many reviews).
    - [X] Many-to-many: Users and Upvotes (many users can have many upvotes).
       

https://github.com/user-attachments/assets/4be66fc3-71c2-4900-8e15-5529144e12f3



  - [X] RESTful API with proper route naming:
    - [x] **GET**: Retrieve books, reviews, and user information.
    - [x] **POST**: Add a new review, save a book to a user’s list.
    - [x] **PATCH**: Update a book review or user profile.
    - [x] **DELETE**: Remove a saved book from a list or delete a review.
       

https://github.com/user-attachments/assets/90e8c85b-8f59-4340-bbe9-9980cef5f4ce


  - [ ] Ability to reset the database to its default state.


- [ ] **Frontend:**
  - [x] Set up React frontend with dynamic routes using React Router.


https://github.com/user-attachments/assets/8abeece6-0c42-4457-bca8-62a2c683d9ad



  - [x] Implement hierarchically designed components with containers and presentational components:
    - [x] **Page Components**: Home, Dashboard, Book Details, Saved Books, Review Pages.
    - [x] **Component Types**: Review component, Book Card, List components.
  - [x] Redirection: Implement user redirection (e.g., after submitting a review).
  - [ ] Interactive elements: Allow users to add reviews and save books without navigating to a new page.
  - [ ] Deploy the app on Railway, ensuring all features and pages work.

## Custom Features
- [ ] **Error Handling**: Implement error messages for actions like failed API calls or invalid form submissions.
- [ ] **One-to-One Database Relationship**: Link each user to a profile that stores their preferences and AI recommendation data.
- [ ] **Modal or Slide-out Pane**: Use a modal for book details or for submitting reviews.
- [ ] **Data Validation**: Validate user input (e.g., review text) before updating the database.
- [ ] **Filtering and Sorting**: Allow users to filter books by genres, ratings, or bestsellers.

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
  - [X] **Bestsellers Feed**: Display a list of bestselling books from the NYT API.
  - [X] **Top Review Books**: Show a feed of books with the most reviews from users.
  - [ ] **Saved Books**: Display the user's saved books on their dashboard.


https://github.com/user-attachments/assets/d76dfdb9-b3b0-4efc-84e9-ef9f9f62c0e2


- [ ] **AI Recommendations**:
  - [ ] Based on the user’s reading history, generate book recommendations using AI.
  - [ ] Display AI-recommended books on the user’s dashboard.

- [ ] **Clipped Books**:
  - [ ] Allow users to clip books to different custom lists (e.g., "Want to Read," "Read").

## Stretch Features
- [X] **Image Upload**: Allow users to upload a profile picture.


https://github.com/user-attachments/assets/f53b924a-3aef-4e98-a88f-32d712a2a389

      
- [X] **Spinners/Loading States**: Show a spinner while book data or reviews are being fetched.


https://github.com/user-attachments/assets/075d3484-ddb8-4112-b3bb-2a1fccc27ff6


- [ ] **Button States**: Disable buttons during form submission to prevent multiple submissions.
- [ ] **Toast Messages**: Provide feedback for user actions like saving a book or submitting a review with toast notifications.

  
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
>CLERK_SECRET_KEY=

5.  add .env file into frontend
>VITE_CLERK_PUBLISHABLE_KEY=
>CLERK_SECRET_KEY=
>GOOGLE_BOOKS_API_KEY=

6.  in the terminal:

>cd backend
>npm install morgan
>npm start

7.  open other terminal to run frontend:

>cd frontend
>npm install @clerk/clerk-react
>npm install react-router-dom
>npm run dev
