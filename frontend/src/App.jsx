import React from 'react';
import { Button, Typography } from '@mui/material';

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to My MUI App!
      </Typography>
      <Button variant="contained" color="primary">
        Click Me!
      </Button>
    </div>
  );
}

export default App;

