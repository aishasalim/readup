// App.jsx 

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';
import HomePage from './pages/HomePage';
import CenteredContainer from './components/CenteredContainer'; 
import BookDetails from './pages/BookDetails';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book/:isbn" element={<BookDetails />} />
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
      </Routes>
    </>
  );
}

export default App;
