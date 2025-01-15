import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, doc, getDoc, collection, getDocs, addDoc, query, where } from "firebase/firestore";
import './index.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const { userId } = useParams();
  const [view, setView] = useState("Pesssoa"); // Opções: pessoas, bibliotecas, midias, emprestimos

  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");

  useEffect(() => {
    if(userId) return
    setView(userId.role === "Admin" ? "Biblioteca" : "Midia");
  },[userId])
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

  const [nomeBiblioteca, setNomeBiblioteca] = useState()
  const [descricaoBi, setDescricaoBi] = useState()
  const [enderecoBi, setEnderecoBi] = useState()
  const [img, setImg] = useState("")

  const handleCadastrarBiblioteca = async () => {
    try {
      // Crie um novo documento na coleção "bibliotecas"
      const db = getFirestore();
      const docRef = await addDoc(collection(db, "Biblioteca"), {
        nome: nomeBiblioteca,  // Nome da biblioteca
        descricao: descricaoBi,  // Descrição da biblioteca
        endereco: enderecoBi,    // Endereço
        img: img               // URL da imagem
      });
      console.log("Biblioteca cadastrada com ID: ", docRef.id);
      alert("Biblioteca cadastrada com sucesso!");
    } catch (e) {
      console.error("Erro ao adicionar biblioteca: ", e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore();
        const collectionName = view.charAt(0).toUpperCase() + view.slice(1);
        let queryRef = collection(db, collectionName);
  
        // Se a view for "Midia", adicionar um filtro para id_Biblioteca
        if (view === "Midia") {
          queryRef = query(queryRef, where("id_Biblioteca", "==", user.idFuncBiblioteca));
        }
  
        const snapshot = await getDocs(queryRef);
  
        // Processar os dados
        const items = snapshot.docs.map((doc) => {
          const rawData = { id: doc.id, ...doc.data() };
  
          // Ordenar as chaves mantendo 'id' como a primeira
          const sortedKeys = Object.keys(rawData).sort((a, b) => {
            if (a === "id") return -1; // 'id' vem antes de qualquer outra chave
            if (b === "id") return 1;  // As outras chaves vêm depois de 'id'
            return a.localeCompare(b); // Ordena as demais chaves alfabeticamente
          });
  
          // Reconstruir o objeto com as chaves na ordem desejada
          const sortedData = sortedKeys.reduce((acc, key) => {
            acc[key] = rawData[key];
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
  
  
  const [openModal, setOpenModal] = useState(null); // Controle do modal aberto

  const handleCloseModal = () => setOpenModal(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [endereco, setEndereco] = useState("");

  const handleAdmin = async () => {
    try {
      const db = getFirestore();

      // Dados do formulário
      const adminData = {
        cpf,
        senha,
        nome,
        email,
        data_nasc: dataNasc,
        endereço: endereco,
        role: "Admin",
      };

      // Adiciona o novo administrador ao Firestore
      await addDoc(collection(db, "Pessoa"), adminData);

      alert("Administrador cadastrado com sucesso!");
      handleCloseModal(); // Fecha o modal
    } catch (error) {
      console.error("Erro ao cadastrar administrador:", error);
      alert("Erro ao cadastrar administrador. Tente novamente.");
    }
  };
  const [senha2, setSenha2] = useState("");
  const [cpf2, setCpf2] = useState("");
  const [nome2, setNome2] = useState("");
  const [email2, setEmail2] = useState("");
  const [dataNas2, setDataNasc2] = useState("");
  const [endereco2, setEndereco2] = useState("");
  const [idBiblioteca, setIdBiblioteca] = useState("");

  const handlefunc = async () => {
    try {
      const db = getFirestore();

      // Dados do formulário
      const adminData = {
        cpf: cpf2,
        senha: senha2,
        nome: nome2,
        email: email2,
        data_nasc: dataNas2,
        endereço: endereco2,
        idFuncBiblioteca:idBiblioteca,
        role: "Funcionario",
      };

      // Adiciona o novo administrador ao Firestore
      await addDoc(collection(db, "Pessoa"), adminData);

      alert("Funcionario cadastrado com sucesso!");
      handleCloseModal(); // Fecha o modal
    } catch (error) {
      console.error("Erro ao cadastrar administrador:", error);
      alert("Erro ao cadastrar administrador. Tente novamente.");
    }
  };

  const handleChangeView = (newView) => {
    setView(newView);
  };

  const [ano, setAno] = useState('');
  const [descricao3, setDescricao3] = useState('');
  const [genero, setGenero] = useState('');
  const [idBiblioteca2, setIdBiblioteca2] = useState('');
  const [tipo, setTipo] = useState('');
  const [titulo, setTitulo] = useState('');

  const [autor, setAutor] = useState('');
  const [editor, setEditor] = useState('');
  const [isbn, setIsbn] = useState('');

  // Campos específicos para 'Filme'
  const [diretor, setDiretor] = useState('');
  const [classificacao, setClassificacao] = useState('');
  const [formato, setFormato] = useState('');

  const handleCadastrarMidia = async () => {
    try {
      // Crie um novo documento na coleção "midias"
      const db = getFirestore();
      let docRef1
      if(tipo === "Livro"){
         docRef1 = await addDoc(collection(db,"Livro"), {
          autor,
          editor,
          isbn,
        })
      }else{
        docRef1 = await addDoc(collection(db,"Filme"), {
          diretor,
          classificacao,
          formato,
        })
      }

      await addDoc(collection(db, "Midia"), {
        ano,
        descricao3,
        disponivel_para_emprestimo: true,
        genero,
        idEmprestimo: null,
        id_Biblioteca: idBiblioteca2,
        tipo,
        titulo,
        // Se o tipo for 'Livro', adicione esses campos
        ...(tipo === 'Livro' && {
          idLivro: docRef1.id
        }),
        // Se o tipo for 'Filme', adicione esses campos
        ...(tipo === 'Filme' && {
          idFilme: docRef1.id
        }),
      });

      alert("Mídia cadastrada com sucesso!");
    } catch (e) {
      console.error("Erro ao adicionar mídia: ", e);
    }
  };


  const formMidia = (
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
          onClick={() => handleCloseModal()} // Implementar lógica de fechamento do modal
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
          <h2 style={{ color: "black" }}>Cadastrar Mídia</h2>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            <p style={{ color: "black" }}>Título</p>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            <p style={{ color: "black" }}>Ano</p>
            <input
              type="text"
              value={ano}
              onChange={(e) => setAno(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            <p style={{ color: "black" }}>Biblioteca</p>
            <input
              value={idBiblioteca2}
              onChange={(e) => setIdBiblioteca2(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            <p style={{ color: "black" }}>Descrição</p>
            <textarea
              value={descricao3}
              onChange={(e) => setDescricao3(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            <p style={{ color: "black" }}>Gênero</p>
            <input
              type="text"
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            <p style={{ color: "black" }}>Tipo</p>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            >
              <option value="">Selecione o tipo</option>
              <option value="Livro">Livro</option>
              <option value="Filme">Filme</option>
            </select>
          </label>
        </div>

        {/* Campos específicos para 'Livro' */}
        {tipo === 'Livro' && (
          <>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                <p style={{ color: "black" }}>Autor</p>
                <input
                  type="text"
                  value={autor}
                  onChange={(e) => setAutor(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                <p style={{ color: "black" }}>Editor</p>
                <input
                  type="text"
                  value={editor}
                  onChange={(e) => setEditor(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                <p style={{ color: "black" }}>ISBN</p>
                <input
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
                />
              </label>
            </div>
          </>
        )}

        {/* Campos específicos para 'Filme' */}
        {tipo === 'Filme' && (
          <>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                <p style={{ color: "black" }}>Diretor</p>
                <input
                  type="text"
                  value={diretor}
                  onChange={(e) => setDiretor(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                <p style={{ color: "black" }}>Classificação</p>
                <input
                  type="text"
                  value={classificacao}
                  onChange={(e) => setClassificacao(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <label>
                <p style={{ color: "black" }}>Formato</p>
                <input
                  type="text"
                  value={formato}
                  onChange={(e) => setFormato(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
                />
              </label>
            </div>
          </>
        )}

        <div>
          <button
            onClick={handleCadastrarMidia}
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Cadastrar Mídia
          </button>
        </div>
      </div>
    </div>
  )


  const formFunc = (
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
            <h2 style={{ color: "black" }}>Cadastrar Funcionario</h2>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              <p style={{ color: "black" }}>Nome</p>
              <input
                type="text"
                value={nome2}
                onChange={(e) => setNome2(e.target.value)}
                style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              <p style={{ color: "black" }}>Email</p>
              <input
                type="email"
                value={email2}
                onChange={(e) => setEmail2(e.target.value)}
                style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              <p style={{ color: "black" }}>CPF</p>
              <input
                type="text"
                value={cpf2}
                onChange={(e) => setCpf2(e.target.value)}
                style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              <p style={{ color: "black" }}>id Biblioteca</p>
              <input
                type="text"
                value={idBiblioteca}
                onChange={(e) => setIdBiblioteca(e.target.value)}
                style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              <p style={{ color: "black" }}>Senha</p>
              <input
                type="password"
                value={senha2}
                onChange={(e) => setSenha2(e.target.value)}
                style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              <p style={{ color: "black" }}>Data de Nascimento</p>
              <input
                type="date"
                value={dataNas2}
                onChange={(e) => setDataNasc2(e.target.value)}
                style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              <p style={{ color: "black" }}>Endereço</p>
              <input
                type="text"
                value={endereco2}
                onChange={(e) => setEndereco2(e.target.value)}
                style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
              />
            </label>
          </div>
          <button
            onClick={handlefunc}
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

  const formBiblioteca = (
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
          <h2 style={{ color: "black" }}>Cadastrar Biblioteca</h2>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            <p style={{ color: "black" }}>Nome</p>
            <input
              type="text"
              value={nomeBiblioteca}
              onChange={(e) => setNomeBiblioteca(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            <p style={{ color: "black" }}>Descrição</p>
            <input
              type="text"
              value={descricaoBi}
              onChange={(e) => setDescricaoBi(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            <p style={{ color: "black" }}>Endereço</p>
            <input
              type="text"
              value={enderecoBi}
              onChange={(e) => setEnderecoBi(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            <p style={{ color: "black" }}>Imagem URL</p>
            <input
              type="text"
              value={img}
              onChange={(e) => setImg(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            />
          </label>
        </div>
        <button
          onClick={handleCadastrarBiblioteca}
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
  );
  

  const formAdmin = (
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
            <h2 style={{ color: "black" }}>Cadastrar Admin</h2>
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
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
              />
            </label>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label>
              <p style={{ color: "black" }}>Senha</p>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
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
        {
          user?.role === "Admin" && (
            <>
            <button
              style={{
                padding: "0.5rem 1rem",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() =>  setOpenModal("admin")}
            >
              Cadastrar Admin
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
              onClick={() => setOpenModal("biblioteca")}
            >
              Cadastrar Biblioteca
            </button>
            
            </>
          )
        }
        {
          user?.role === "Funcionario" && (
            <>
            <button
              style={{
                padding: "0.5rem 1rem",
                background: "#ffc107",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => setOpenModal("midia")}
            >
              Cadastrar Mídia
            </button>
            </>
          )
        }
              <button
                style={{
                  padding: "0.5rem 1rem",
                  background: "#007b7f",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
                onClick={() =>  setOpenModal("func")}
              >
                Cadastrar Funcionario 
              </button>


      </div>
      {openModal && (
        openModal === "Admin" && formAdmin ||
        openModal === "func" && formFunc ||
        openModal === "biblioteca" && formBiblioteca ||
        openModal === "midia" && formMidia
      
      )}
      <div style={{ marginBottom: "2rem" }}>
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
          {
            user?.role === "Funcionario" &&
          <>
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
          </>
          }
      </div>

      <div style={{ width: "100%" }}>

        <table style={{ width: "100%", borderCollapse: "collapse",  tableLayout: "fixed", }}>
          <thead style={{ width: "100%", borderCollapse: "collapse" }}>
            <tr>
              {data.length > 0 &&
                Object.keys(data[0]).map((key, index) => (
                  <th
                    key={key}
                    style={{
                      border: "1px solid #ddd",
                      padding: "0.5rem",
                      textAlign: "left",
                      backgroundColor: "#f4f4f4",
                      ...(index === 0 ? {
                        width: "250px"
                      } : {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }),
                    }}
                  >
                    {key}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody style={{ width: "100%", borderCollapse: "collapse" }}>
            {data.map((item) => (
              <tr key={item.id}>
                {Object.values(item).map((value, index) => (
                  <td
                    key={index}
                    style={{
                      border: "1px solid #ddd",
                      padding: "0.5rem",
                      ...(index === 0 ? {
                        width: "100px"
                      } : {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }),
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
    </div>
  );
};



export default ProfilePage;
