import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("Pessoa"); // Opções: pessoas, bibliotecas, midias, emprestimos
  const [data, setData] = useState([]);
  const userId = "x5Srq33zkYhzFF8ATVob";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "Pessoa", userId));
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() });
        } else {
          console.error("Usuário não encontrado.");
        }
      } catch (error) {
        console.error("Erro ao buscar o usuário:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore();
        const collectionName = view.charAt(0).toUpperCase() + view.slice(1);
        const snapshot = await getDocs(collection(db, collectionName));
        
        // Processar os dados
        const items = snapshot.docs.map((doc) => {
          const rawData = { id: doc.id, ...doc.data() };
          // Ordenar as chaves do objeto em ordem alfabética
          const sortedData = Object.keys(rawData)
            .sort() // Ordena as chaves alfabeticamente
            .reduce((acc, key) => {
              acc[key] = rawData[key]; // Reconstrói o objeto com as chaves na ordem
              return acc;
            }, {});
          return sortedData;
        });
        
        setData(items);
      } catch (error) {
        console.error(`Erro ao buscar ${view}:`, error);
      }
    };

    fetchData();
  }, [view]);

  const handleChangeView = (newView) => {
    setView(newView);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <header style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
        {user && (
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#ddd",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "2rem",
              color: "#333",
              marginRight: "1rem",
            }}
          >
            {user.image ? (
              <img
                src={user.image}
                alt={user.nome}
                style={{ width: "100%", height: "100%", borderRadius: "50%" }}
              />
            ) : (
              user.nome.charAt(0).toUpperCase()
            )}
          </div>
        )}
        <div>
          <h1>{user?.nome || "Usuário"}</h1>
          <p>{user?.email || "Email não disponível"}</p>
        </div>
      </header>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <button
          style={{
            padding: "0.5rem 1rem",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => console.log("Cadastrar Usuário")}
        >
          Cadastrar Usuário
        </button>
        <button
          style={{
            padding: "0.5rem 1rem",
            background: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => console.log("Cadastrar Biblioteca")}
        >
          Cadastrar Biblioteca
        </button>
        <button
          style={{
            padding: "0.5rem 1rem",
            background: "#ffc107",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => console.log("Cadastrar Mídia")}
        >
          Cadastrar Mídia
        </button>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <button
          style={{
            marginRight: "1rem",
            padding: "0.5rem 1rem",
            background: view === "pessoas" ? "#007bff" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => handleChangeView("Pessoa")}
        >
          Todas as Pessoas
        </button>
        <button
          style={{
            marginRight: "1rem",
            padding: "0.5rem 1rem",
            background: view === "bibliotecas" ? "#007bff" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => handleChangeView("Biblioteca")}
        >
          Todas as Bibliotecas
        </button>
        <button
          style={{
            marginRight: "1rem",
            padding: "0.5rem 1rem",
            background: view === "midias" ? "#007bff" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => handleChangeView("Midia")}
        >
          Todas as Mídias
        </button>
        <button
          style={{
            padding: "0.5rem 1rem",
            background: view === "emprestimos" ? "#007bff" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => handleChangeView("Emprestimo")}
        >
          Todos os Empréstimos
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {data.length > 0 &&
              Object.keys(data[0]).map((key) => (
                <th
                  key={key}
                  style={{
                    border: "1px solid #ddd",
                    padding: "0.5rem",
                    textAlign: "left",
                    backgroundColor: "#f4f4f4",
                  }}
                >
                  {key}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              {Object.values(item).map((value, index) => (
                <td
                  key={index}
                  style={{
                    border: "1px solid #ddd",
                    padding: "0.5rem",
                  }}
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProfilePage;
