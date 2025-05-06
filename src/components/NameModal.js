import React, { useState } from 'react';
// import './NameModal.css';

const NameModal = ({ setName, setIsNameModalOpen, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async () => {
    const credentials = { username, password };
    onLogin(credentials, isRegistering);
  };

  return (
    <div className="name-modal">
      <h2 className="header">LingoXR</h2>
      <h3>{isRegistering ? "Register" : "Login"}</h3>
      
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <br></br>
      <br></br>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      
      <br></br>
      <br></br>
      <button className="name-submit" onClick={handleSubmit}>
        {isRegistering ? "Register" : "Login"}
      </button>
      
      <p onClick={() => setIsRegistering(!isRegistering)} style={{ cursor: 'pointer', color: 'blue' }}>
        {isRegistering ? "Already have an account? Login" : "No account? Register"}
      </p>
    </div>
  );
};

export default NameModal;
