import { store } from '../shared/store'; // 1. Импортираме директно инстанцията на Store-а
import { checkUserAuth } from './store/authSlice'; // 2. Импортираме thunk-а за обновяване

// Взимаме URL-а от env променливите
const API_URL = import.meta.env.VITE_API_URL;

export function openGoogleLoginPopup() {
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    `${API_URL}/auth/google/login`,
    "google-login",
    `width=${width},height=${height},top=${top},left=${left},resizable,scrollbars=yes,status=1`
  );

  if (!popup) {
    alert("Popup blocked. Please allow popups for this site.");
    return;
  }

  function handleMessage(event: MessageEvent) {
    
    if (event.origin !== new URL(API_URL).origin) {
      return; 
    }

    if (event.data && event.data.type === "AUTH_SUCCESS") {
      
      console.log("🔐 Login successful! Refreshing user state...");
      store.dispatch(checkUserAuth());
      window.removeEventListener("message", handleMessage);
    }
    
    if (event.data && event.data.type === "AUTH_ERROR") {
      console.error("Login failed:", event.data.message);
      window.removeEventListener("message", handleMessage);
    }
  }

  // Слушаме за съобщения
  window.addEventListener("message", handleMessage);
}