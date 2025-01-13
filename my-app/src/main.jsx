import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import MediaPage from "./MediaPage";
import ProfilePage from "./ProfilePage";

// Obtém o elemento root do DOM
const rootElement = document.getElementById("root");

// Cria o root usando React 18
const root = ReactDOM.createRoot(rootElement);

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/midia/:idBiblioteca" element={<MediaPage />} />
      <Route path="/ProfilePage/:id" element={<ProfilePage />} />
    </Routes>
  </BrowserRouter>
);
