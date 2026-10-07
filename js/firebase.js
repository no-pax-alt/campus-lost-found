import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBnvEGOHgmXwEPfw-nExeOaG9VNmC8pnN8",
  authDomain: "campus-lost-found-200f8.firebaseapp.com",
  projectId: "campus-lost-found-200f8",
  appId: "1:251358982012:web:80d3e33afa827b7f12bef9"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);