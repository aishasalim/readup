// App.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import CenteredContainer from './components/CenteredContainer';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { CircularProgress } from '@mui/material';

// Lazy-loaded components
const HomePage = lazy(() => import('./pages/HomePage'));
const BookDetails = lazy(() => import('./pages/BookDetails'));
const CreateReviewISBN = lazy(() => import('./pages/CreateReviewISBN'));
const CreateReviewSearch = lazy(() => import('./pages/CreateReviewSearch'));
const EditReview = lazy(() => import('./pages/EditReview'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const NotFound = lazy(() => import('./components/NotFound'));

function App() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <CircularProgress />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book/:isbn" element={<BookDetails />} />
        <Route path="/book/create/:isbn" element={<CreateReviewISBN />} />
        <Route path="/create" element={<CreateReviewSearch />} />
        <Route path="/:isbn/reviews/:reviewId/edit" element={<EditReview />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* SignIn Route */}
        <Route
          path="/sign-in/*"
          element={
            <CenteredContainer>
              <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
            </CenteredContainer>
          }
        />

        {/* SignUp Route */}
        <Route
          path="/sign-up/*"
          element={
            <CenteredContainer>
              <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
            </CenteredContainer>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
