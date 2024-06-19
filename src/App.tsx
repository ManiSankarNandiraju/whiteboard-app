import React, { useState } from 'react';
import Canvas from './components/Canvas';
import Login from './components/Login';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (username: string, password: string) => {
    if (username === 'admin' && password === 'admin') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect username or password');
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {isAuthenticated ? <Canvas /> : <Login onLogin={handleLogin} />}
    </div>
  );
};

export default App;
