// (Temporary for testing)

import React from 'react';
import Register from './pages/Register'; // 👈 Import the component

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to ChatApp</h1>
      </header>
      <main>
        {/* Display the registration form */}
        <Register /> 
      </main>
    </div>
  );
}

export default App;