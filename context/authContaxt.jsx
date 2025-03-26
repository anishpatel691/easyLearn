// src/context/UserContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

// Create the context
const UserContext = createContext();

// Custom hook to use the UserContext
export const useUser = () => {
  return useContext(UserContext);
};
//it is prectice purpuses
export const loginStatus = () => {
    return useContext(UserContext);
  };
  
// Provider component
export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(localStorage.getItem("Userid"));
  const [loginStatus, setLoginStatus] = useState(sessionStorage.getItem("LoginStatus"));
  const [usertypeInstru, setUsertypeInstructor] = useState(sessionStorage.getItem("UsertypeInstru"));
  const [usertype, setUsertypeStudent] = useState(sessionStorage.getItem("UsertypeStudent"));
const [authToken,setauthToken]=useState(sessionStorage.getItem("authToken"));
  console.log("user ststus",loginStatus);
const [instructorId,setinstroucterId]=useState()
 console.log("usertype student in auth",usertype);
 console.log("authToken 2",authToken);
 
 const he =localStorage.getItem("Usertype")
  console.log("usertype in auth",he);
  const logout2 = () => { 
    sessionStorage.removeItem('Usertype');
    sessionStorage.removeItem('UsertypeIn');
    sessionStorage.removeItem('UsertypeStudent');
    sessionStorage.removeItem('UsertypeInstru');
    sessionStorage.removeItem('authToken');


    setUserId(null);
    setLoginStatus(null);
    setUsertypeStudent(null);
    setUsertypeInstructor(null);
    setauthToken(null);
  };

  useEffect(() => {
    // Sync the values with sessionStorage and localStorage
    if (userId) {
      localStorage.setItem("Userid", userId);
    }
    if (loginStatus) {
      sessionStorage.setItem("LoginStatus", loginStatus);
    }
    
    if (usertypeInstru){
      sessionStorage.setItem("UsertypeIn", usertypeInstru);
   }
   if (authToken){
    sessionStorage.setItem("authToken", authToken);
 }
 
    if (usertype){
      sessionStorage.setItem("Usertype", usertype);
    }
    if(instructorId){
      sessionStorage.setItem("instroucterId",instructorId);

    }
  }, [userId, loginStatus, usertypeInstru, authToken,usertype,logout2,instructorId]);

  console.log("2user type is==",usertypeInstru);
  console.log("2usertype student in auth==",usertype);
  const updateUser = (id, status,authToken,instructorId) => {
    setUserId(id);
    setLoginStatus(status);
    setauthToken(authToken);
    setinstroucterId(instructorId)
  };


  
  return (
    <UserContext.Provider value={{ userId,authToken, loginStatus, instructorId,updateUser, logout2, setUsertypeStudent, setUsertypeInstructor,setauthToken, setinstroucterId,  usertype, usertypeInstru }}>
      {children}
    </UserContext.Provider>
  );
};
