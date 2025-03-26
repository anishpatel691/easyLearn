import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import a notification sound
import notificationSound from "../../src/assets/notifi.mp3"; // Adjust the path to your sound file
import errornotificationSound from "../../src/assets/notify.mp3"; // Adjust the path to your sound file

// Play sound when a toast is triggered
const playSound = () => {
  try {
    const audio = new Audio(notificationSound);
    audio.play().catch((error) => {
      console.error("Audio playback failed:", error.message);
    });
  } catch (error) {
    console.error("Error playing notification sound:", error.message);
  }
};

const errPlaySound = () => {
  try {
    const audio = new Audio(errornotificationSound);
    audio.play().catch((error) => {
      console.error("Audio playback failed:", error.message);
    });
  } catch (error) {
    console.error("Error playing notification sound:", error.message);
  }
};
// Override default toast methods to include sound
const notifySuccess = (message, options = {}) => {
  playSound(); // Play the sound
  toast.success(message, { position: "top-right", autoClose: 1000, theme: "colored", ...options });
};

const notifyError = (message, options = {}) => {
  errPlaySound(); // Play the sound
  toast.error(message, { position: "top-right", autoClose: 1000, theme: "colored", ...options });
};

const notifyInfo = (message, options = {}) => {
  playSound(); // Play the sound
  toast.info(message, { position: "top-right", autoClose: 1000, theme: "colored", ...options });
};

const Notification = () => (
  <ToastContainer
    position="top-right"
    autoClose={1000}
    hideProgressBar={false}
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="colored"
  />
);

export { notifySuccess, notifyError, notifyInfo };
export default Notification;
