import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, query, where, addDoc } from "firebase/firestore";
import app from "./firebaseConfig";
import { useNavigate } from "react-router-dom";
import './index.css';


const fetchAddressByCEP = async (cep) => {
  try {
    const response = await fetch(`https://cdn.apicep.com/file/apicep/${cep}.json`);
    if (!response.ok) throw new Error("Erro ao buscar o CEP");
    return await response.json();
  } catch (error) {
    console.error("Erro ao buscar endereço:", error);
    return null;
  }
};

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(app);
  const navigate = useNavigate();
  const [cadastraOpen, setCadastraOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cpfCadastra, setCpfCadastra] = useState("");
  const [senhaCadastra, setSenhaCadastra] = useState("");

  const handleAdmin = async () => {
      try {
        const db = getFirestore();
  
        // Dados do formulário
        const adminData = {
          cpf: cpfCadastra,
          senha: senhaCadastra,
          nome,
          email,
          data_nasc: dataNasc,
          endereço: endereco,
        };
  
        // Adiciona o novo administrador ao Firestore
        const userDoc = await addDoc(collection(db, "Pessoa"), adminData);
  
        const id = userDoc.id;
            setUserId(id);
            localStorage.setItem("userId", id); 
        alert("Administrador cadastrado com sucesso!");
        handleCloseModal(); // Fecha o modal
      } catch (error) {
        console.error("Erro ao cadastrar administrador:", error);
        alert("Erro ao cadastrar administrador. Tente novamente.");
      }
    };

  const handleCloseModal = () => {
    setCadastraOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Biblioteca"));
        const items = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        const itemsWithAddress = await Promise.all(
          items.map(async (item) => {
            const address = item.endereco ? await fetchAddressByCEP(item.endereco) : null;
            return { ...item, address: address?.ok ? address : null };
          })
        );

        setData(itemsWithAddress || items);
      } catch (error) {
        console.error("Erro ao buscar dados do Firebase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [db]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(()  => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      setUserId(userId);
      console.log(userId);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const db = getFirestore();
      const pessoasRef = collection(db, "Pessoa");
      const q = query(pessoasRef, where("cpf", "==", cpf), where("senha", "==", senha));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("CPF ou senha incorretos.");
      } else {
        const userDoc = querySnapshot.docs[0];
        const id = userDoc.id;
        setUserId(id);
        localStorage.setItem("userId", id); // Salva o ID no localStorage
        setIsModalOpen(false); // Fecha o modal
      }
    } catch (err) {
      console.error("Erro ao autenticar:", err);
      setError("Ocorreu um erro ao tentar fazer login.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    setUserId(null); // Limpa o estado local, se necessário
  };
  

  return (
    <div style={{ display: "flex", justifyContent: "center", backgroundColor: "#f4f4f4", alignItems: "center", flexDirection: "column", width: "100%" }}>
      <header style={{ padding: "1rem", background: "#282c34", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <h1>Bibliotecas</h1>
        {userId ? (
          <div style={{ display: "flex", gap: "1rem" }}>

            <button
              style={{
                padding: "0.5rem 1rem",
                background: "#61dafb",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/ProfilePage/${userId}`)}
            >
              Perfil
            </button>

            <button
              style={{
                padding: "0.5rem 1rem",
                background: "red",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => handleLogout()}
            >
              Logout
            </button>

          </div>
        ) : 

          <button
          style={{
            padding: "0.5rem 1rem",
            background: "#61dafb",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={() => setIsModalOpen(true)}
        >
          Login
        </button>
        }

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              padding: "2rem",
              width: "400px",
              position: "relative",
            }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
            >
              &times;
            </button>
            <div style={{ marginBottom: "1rem", textAlign: "center" }}>
              <h2 style={{ color:"black",  }}>Login</h2>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>
              <p style={{ color:"black" }}>Cpf</p>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                <p style={{ color:"black" }}>Senha</p>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
                />
              </label>
            </div>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button
              onClick={handleLogin}
              style={{
                padding: "0.5rem 1rem",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Entrar
            </button>
            <button
                  type="button"
                  style={{
                    marginTop: "1rem",
                    padding: "0.5rem 1rem",
                    background: "#007b7f",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginLeft: "1rem",
                  }}
                  onClick={() => {setIsModalOpen(false);setCadastraOpen(true)}}
                >
                  Cadastrar
                </button>
          </div>
        </div>
      )}
      </header>

      <div style={{ padding: "2rem", minHeight: "100vh", maxWidth: "1456px" }}>
        {loading ? (
          <p>Carregando dados...</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
            {data.map((item) => (
              <li key={item.id} style={{  width: "400px", backgroundColor: "#fff", borderRadius: "8px", padding: "1.5rem", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}>
                <img
                  src={item.img || "https://via.placeholder.com/250x150?text=Imagem+Indisponível"}
                  alt={item.nome || "Imagem da biblioteca"}
                  style={{ width: "100%", height: "255px", borderRadius: "8px", marginBottom: "1rem" }}
                />
                <div style={{ width: "100%" }}>
                    <h2 style={{ fontSize: "1.5rem", color: "#333", marginBottom: "1rem" }}>{item.nome || "Nome não informado"}</h2>
                    <p style={{ fontSize: "1rem", color: "#555", marginBottom: "1rem" }}>{item.descricao || "Descrição não disponível"}</p>
                    {item.address ? (
                      <>
                        <p style={{ fontSize: "0.9rem", color: "#333", marginBottom: "0.5rem" }}>
                          <strong>Endereço:</strong> {item.address.address}, {item.address.district}, {item.address.city} - {item.address.state}
                        </p>
                        <p style={{ fontSize: "0.9rem", color: "#333", marginBottom: "1.5rem" }}>
                          <strong>CEP:</strong> {item.endereco}
                        </p>
                      </>
                    ) : (
                      <p style={{ color: "red", fontSize: "0.9rem", marginBottom: "1rem" }}>Endereço não encontrado ou não disponível.</p>
                    )}
                  </div>
                <button
                  style={{
                    padding: "0.5rem 1.5rem",
                    backgroundColor: "#61dafb",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    width: "100%",
                  }}
                  onClick={() => navigate(`/midia/${item.id}`, { state: { nomeBiblioteca: item.nome } })}
                >
                  Ver Coleção 
                </button>
              </li>
            ))}
          </ul>
        )}

{cadastraOpen && (
<div
style={{
position: "fixed",
top: "0",
left: "0",
width: "100%",
height: "100%",
background: "rgba(0, 0, 0, 0.5)",
display: "flex",
justifyContent: "center",
alignItems: "center",
}}
>
<div
style={{
background: "white",
borderRadius: "8px",
padding: "2rem",
width: "400px",
position: "relative",
}}
>
<button
onClick={handleCloseModal}
style={{
 position: "absolute",
 top: "10px",
 right: "10px",
 background: "none",
 border: "none",
 fontSize: "1.5rem",
 cursor: "pointer",
}}
>
&times;
</button>
<div style={{ marginBottom: "1rem", textAlign: "center" }}>
<h2 style={{ color: "black" }}>Cadastrar</h2>
</div>
<div style={{ marginBottom: "1rem" }}>
<label>
 <p style={{ color: "black" }}>Nome</p>
 <input
   type="text"
   value={nome}
   onChange={(e) => setNome(e.target.value)}
   style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
 />
</label>
</div>
<div style={{ marginBottom: "1rem" }}>
<label>
 <p style={{ color: "black" }}>Email</p>
 <input
   type="email"
   value={email}
   onChange={(e) => setEmail(e.target.value)}
   style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
 />
</label>
</div>
<div style={{ marginBottom: "1rem" }}>
<label>
 <p style={{ color: "black" }}>CPF</p>
 <input
   type="text"
   value={cpfCadastra}
   onChange={(e) => setCpfCadastra(e.target.value)}
   style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
 />
</label>
</div>
<div style={{ marginBottom: "1rem" }}>
<label>
 <p style={{ color: "black" }}>Senha</p>
 <input
   type="password"
   value={senhaCadastra}
   onChange={(e) => setSenhaCadastra(e.target.value)}
   style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
 />
</label>
</div>
<div style={{ marginBottom: "1rem" }}>
<label>
 <p style={{ color: "black" }}>Data de Nascimento</p>
 <input
   type="date"
   value={dataNasc}
   onChange={(e) => setDataNasc(e.target.value)}
   style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
 />
</label>
</div>
<div style={{ marginBottom: "1rem" }}>
<label>
 <p style={{ color: "black" }}>Endereço</p>
 <input
   type="text"
   value={endereco}
   onChange={(e) => setEndereco(e.target.value)}
   style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
 />
</label>
</div>
<button
onClick={handleAdmin}
style={{
 padding: "0.5rem 1rem",
 background: "#28a745",
 color: "white",
 border: "none",
 borderRadius: "5px",
 cursor: "pointer",
}}
>
Cadastrar
</button>
</div>
</div>
      )
      }
      </div>
    </div>
  );
}

export default App;