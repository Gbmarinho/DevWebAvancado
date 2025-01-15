import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyC1Jsi9vQBtjobz87CnwuEXFS2-wZsrI8Q",
  authDomain: "projeto-dev-web-avnacado.firebaseapp.com",
  projectId: "projeto-dev-web-avnacado",
  storageBucket: "projeto-dev-web-avnacado.firebasestorage.app",
  messagingSenderId: "604694625835",
  appId: "1:604694625835:web:9196c1749b19b4f412746e"
};

const app = initializeApp(firebaseConfig);

export default app;
