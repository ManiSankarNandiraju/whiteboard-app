import React, { useState } from 'react';
import './Login.css'; // Import the CSS file

interface LoginProps {
  onLogin: (username: string, password: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="login-container">
      <h1 className="login-heading">White Board</h1>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label">Username </label>
          <input
            className="input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="label">Password </label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="button-container">
          <button className="button" type="submit">Login</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
