// src/components/SomeOtherComponent.js
import React from "react";
import { useUser } from "../context/authContaxt";
const SomeOtherComponent = () => {
  const { userId, loginStatus } = useUser(); // Access the userId and loginStatus from context
  console.log("hello",userId);
  console.log("status",loginStatus);

  
  return (
    <div>
      {userId ? (
        <p>Welcome, User ID: {userId}</p>
      ) : (
        <p>Please log in to continue.</p>
      )}
      {loginStatus === "loggedIn" ? (
        <p>You are logged in.</p>
      ) : (
        <p>You are not logged in.</p>
      )}
    </div>
  );
};

export default SomeOtherComponent;
