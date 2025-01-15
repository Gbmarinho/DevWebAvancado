import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFirestore, collection, getDocs, query, where,updateDoc, addDoc, doc } from "firebase/firestore";
import app from "./firebaseConfig";
import './index.css';
import { useNavigate } from "react-router-dom";
import { format, set } from "date-fns";



function MediaPage() {
  const { idBiblioteca } = useParams();
  const [midias, setMidias] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore(app);
  const [nomeBiblioteca, setNomeBiblioteca] = useState("Biblioteca");
  const [selectedBookId, setSelectedBookId] = useState(null); // ID do livro selecionado
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenLogin, setIsModalOpenLogin] = useState(false);
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const [dataRetirada, setDataRetirada] = useState("");
  const [cadastraOpen, setCadastraOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [dataNasc, setDataNasc] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cpfCadastra, setCpfCadastra] = useState("");
  const [senhaCadastra, setSenhaCadastra] = useState("");
  const [titulo, setTitulo] = useState("");


  const adicionar30Dias = (dataRetirada) => {
    const [ano, mes, dia] = dataRetirada.split("-").map(Number);
    const dataInicial = new Date(ano, mes - 1, dia); // Date usa meses de 0 a 11
    const dataFinal = new Date(dataInicial);
    dataFinal.setDate(dataInicial.getDate() + 30);
    return format(dataFinal, "dd/MM/yyyy");
  };
  
  const handleCriarEmprestimo = async () => {
    try {
      const db = getFirestore();
  
      // Calcular a data de devolução
      const dataDevolucao = adicionar30Dias(dataRetirada);
  
      // Criar o empréstimo no Firestore
      const emprestimoRef = await addDoc(collection(db, "Emprestimo"), {
        id_biblioteca: idBiblioteca,
        id_midia: selectedBookId,
        id_pessoa: userId,
        biblioteca:nomeBiblioteca,
        titulo: titulo,
        inicio: format(new Date(dataRetirada), "dd/MM/yyyy"),
        termino: dataDevolucao,
      });
  
      console.log("Empréstimo criado com sucesso, ID:", emprestimoRef.id);
  
      // Atualizar a mídia associada
      const midiaRef = doc(db, "Midia", selectedBookId);
      await updateDoc(midiaRef, {
        idEmprestimo: emprestimoRef.id,
        disponivel_para_emprestimo: false,
      });
  
      alert("Empréstimo criado e mídia atualizada com sucesso!");
      window.location.reload()
    } catch (error) {
      console.error("Erro ao criar empréstimo ou atualizar mídia:", error);
    }
  };


  useEffect(()  => {
    const userId = localStorage.getItem("userId");
    console.log(userId)
    if(userId) setUserId(userId);
  }, []);
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

  const handleLogin = async () => {
      try {
        const db = getFirestore();
        const pessoasRef = collection(db, "Pessoa");
        const q = query(pessoasRef, where("cpf", "==", cpf), where("senha", "==", senha));
        const querySnapshot = await getDocs(q);
  
        if (querySnapshot.empty) {
          console.log("tesss")
        } else {
          const userDoc = querySnapshot.docs[0];
          const id = userDoc.id;
          setUserId(id);
          localStorage.setItem("userId", id); // Salva o ID no localStorage
          setIsModalOpenLogin(false); // Fecha o modal
        }
      } catch (err) {
        console.error("Erro ao autenticar:", err);
      }
    };

    const handleLogout = () => {
      localStorage.removeItem("userId");
      setUserId(null); // Limpa o estado local, se necessário
    };


  useEffect(() => {
    const fetchMidias = async () => {
      try {
        // Buscar todas as mídias associadas à biblioteca
        const querySnapshot = await getDocs(collection(db, "Midia"));
        const filteredMidias = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((midia) => midia.id_Biblioteca === idBiblioteca && midia.disponivel_para_emprestimo);

        // Buscar o nome da biblioteca
        const querySnapshot2 = await getDocs(collection(db, "Biblioteca"));
        const biblioteca = querySnapshot2.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .find((item) => item.id === idBiblioteca);

        if (biblioteca) {
          setNomeBiblioteca(biblioteca.nome);
        }

        // Buscar informações adicionais de Livro ou Filme, se necessário
        const midiasComDetalhes = await Promise.all(
          filteredMidias.map(async (midia) => {
            if (midia.tipo === "Livro" && midia.idLivro) {
              const livroSnapshot = await getDocs(collection(db, "Livro"));
              const livro = livroSnapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))
                .find((item) => item.id === midia.idLivro);

              return {
                ...midia,
                livro: livro || null,
              };
            } else if (midia.tipo === "Filme" && midia.idFilme) {
              const filmeSnapshot = await getDocs(collection(db, "Filme"));
              const filme = filmeSnapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))
                .find((item) => item.id === midia.idFilme);

              return {
                ...midia,
                filme: filme || null,
              };
            }
            return midia;
          })
        );

        setMidias(midiasComDetalhes);
      } catch (error) {
        console.error("Erro ao buscar mídias:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMidias();
  }, [idBiblioteca]);

  const handleOpenModal = (bookId, titulo) => {
    setSelectedBookId(bookId);
    setTitulo(titulo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedBookId(null);
    setIsModalOpen(false);
    setIsModalOpenLogin(false);
    setCadastraOpen(false);
  };

  return (
    <div style={{ backgroundColor: "#f4f4f4", minHeight: "100vh" }}>
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
          onClick={() => setIsModalOpenLogin(true)}
        >
          Login
        </button>
        }

      {isModalOpenLogin && (
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
              onClick={() => setIsModalOpenLogin(false)}
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
                  }}
                  onClick={() => {setIsModalOpenLogin(false);setCadastraOpen(true)}}
                >
                  Cadastrar
                </button>
          </div>
        </div>
      )}
      </header>


      <h1 style={{ textAlign: "center", marginBottom: "2rem", marginTop: "2rem" }}>Mídias da {nomeBiblioteca}</h1>
      {loading ? (
        <p style={{ textAlign: "center", fontSize: "1.2rem" }}>Carregando mídias...</p>
      ) : midias.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", textAlign: "center" }}>
          <svg width="152" height="152" viewBox="0 0 152 152" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_16362_2161)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M111.251 15.3014C127.106 23.4353 136.822 39.7418 140.696 56.8485C144.407 73.2333 140.482 90.1672 131.437 104.424C122.692 118.208 108.895 127.886 92.9091 132.174C76.8254 136.488 59.72 135.296 45.0103 127.606C29.7979 119.652 17.5681 106.618 12.931 90.3584C8.25007 73.9444 11.1975 56.1344 20.5243 41.7445C29.5006 27.8956 45.0544 20.7016 61.1132 16.0211C77.7664 11.1674 95.8611 7.40595 111.251 15.3014Z" fill="#212B36" fill-opacity="0.05"/>
<path d="M55.4452 6.8574C57.0075 -0.206422 67.441 2.10826 67.441 2.10826C66.6933 1.76754 65.3985 0.965367 66.2008 0.482365C66.8548 0.0886276 67.3802 0.661698 67.6627 1.18291C67.3481 0.415915 67.1284 -0.699342 68.0597 -0.819244C69.1394 -0.958246 68.9344 1.05712 68.6969 2.08219C71.894 2.77076 73.1707 5.97821 80.4337 9.63592C89.5124 14.2081 96.2177 13.2574 100.026 12.7898C124.784 9.74944 112.916 46.4594 93.2433 38.5268C80.627 33.4397 63.5567 17.8439 57.53 12.1057C56.0822 10.7273 55.0112 8.82011 55.4452 6.8574Z" fill="#434950"/>
<path d="M3.87857 144.393C1.84789 144.393 0.796872 144.833 0.31835 145.452C-0.993638 147.148 2.03773 148.696 4.16773 148.696L7.68373 148.696C8.38126 148.696 9.07243 148.564 9.72156 148.306L17.5005 145.221C19.5265 144.417 20.6555 142.225 20.1469 140.082C19.7998 138.619 20.0464 137.078 20.8316 135.802L25.6087 128.043L17.715 132.308C17.3846 136.994 7.88149 144.393 3.87857 144.393Z" fill="url(#paint0_linear_16362_2161)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M111.449 91.6956L152 108.272L151.638 109.162L111.409 92.7174L49.4615 112.576L30.6955 123.313L10.706 152.826L9.91309 152.286L30.0275 122.588L49.0738 111.691L111.449 91.6956Z" fill="#0D1116"/>
<path d="M40.7501 21.3182C39.8687 22.1989 37.1877 27.4416 36.3477 30.2812L43.229 30.5652L44.6062 23.2997C49.5641 21.0981 52.8694 16.9149 52.8694 15.5939C52.8694 14.5371 51.6758 13.9794 51.2168 14.2729C51.2168 13.3923 50.4823 13.4656 49.8396 13.6124C49.6192 12.5556 48.4624 12.8785 48.1869 13.1721C47.9115 12.2914 46.2589 12.0713 45.4325 12.9519C46.5343 14.0528 45.5187 16.5119 44.0554 18.0157C42.1273 19.9972 41.8518 20.2174 40.7501 21.3182Z" fill="#FFC5C1"/>
<path d="M63.3442 30.0771C79.4415 22.631 87.7776 27.786 95.8263 34.9457L69.3931 35.6485C61.8235 39.467 46.6144 49.7807 41.7852 51.8427C35.7487 54.4202 30.862 54.7066 30.5746 50.1244C30.3446 46.4586 34.5156 30.7799 36.0486 27.0568H43.8099L39.4856 43.5374C42.5517 41.1509 50.4088 36.0606 63.3442 30.0771Z" fill="#A6ADB5"/>
<path d="M58.5175 5.78261C56.7885 7.24337 55.106 9.93461 55.979 17.3244C56.1735 17.9172 55.8478 18.9065 55.4366 19.6738C55.2144 20.0885 55.4256 20.6999 55.8813 20.7925L56.27 20.8714C56.3669 22.1523 57.1504 25.1186 59.7617 25.6009C62.9625 26.1921 64.0907 25.1337 66.4542 24.4185L70.8189 29.7391L80.1303 27.0788C78.6754 26.7832 75.1836 22.9406 74.0197 21.167C73.0886 19.7482 72.5648 17.5214 72.8558 16.7332C76.3475 12.8905 75.1836 9.63902 72.5648 9.34343C70.4697 9.10696 69.655 11.4126 70.237 13.4817C62.3223 13.0087 59.0025 8.54145 58.5175 5.78261Z" fill="#FFEBF0"/>
<path d="M67.739 21.4783C67.5869 22.3785 66.5206 23.7573 65.2607 24.3696L67.739 27.2609L67.739 21.4783Z" fill="url(#paint1_linear_16362_2161)"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M58.6895 5.83387C58.74 5.89507 58.7327 5.98682 58.6733 6.0388C57.7042 6.88678 56.8921 7.87635 56.4215 9.54163C55.9494 11.2118 55.8179 13.572 56.2352 17.165C56.3362 17.493 56.2959 17.9069 56.1908 18.3172C56.0828 18.7386 55.9005 19.1784 55.6984 19.5611C55.6138 19.7211 55.6092 19.9266 55.6754 20.1038C55.7414 20.2804 55.8692 20.4087 56.0304 20.4419L56.5094 20.5406L56.5176 20.6504C56.6098 21.8845 57.1507 24.1623 59.4734 25.0245C60.9738 25.5815 62.9732 25.3067 64.7119 24.5257C66.4539 23.7432 67.8846 22.4757 68.2888 21.1003C68.3114 21.0234 68.3902 20.98 68.4648 21.0033C68.5394 21.0265 68.5815 21.1077 68.559 21.1845C68.1195 22.6798 66.5977 23.9958 64.8247 24.7922C63.0485 25.5901 60.9705 25.8894 59.3777 25.2981C56.9633 24.4018 56.3641 22.0773 56.2454 20.7827L55.975 20.727C55.6973 20.6698 55.5039 20.4542 55.412 20.2082C55.3203 19.9629 55.321 19.6672 55.4505 19.4221C55.6443 19.0552 55.8169 18.6371 55.9179 18.243C56.0201 17.8441 56.0434 17.4914 55.9628 17.2424L55.9583 17.2284L55.9566 17.2138C55.5353 13.5957 55.6625 11.1868 56.1505 9.46034C56.6404 7.72674 57.4913 6.6916 58.4906 5.81719C58.55 5.76521 58.6391 5.77268 58.6895 5.83387Z" fill="#EB99A2"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M97.8019 35.9171C97.8757 35.9833 97.9497 36.0497 98.0236 36.116C101.263 39.0215 104.047 44.0681 106.211 49.177C108.376 54.2907 109.929 59.4879 110.696 62.7142L110.415 62.7826C109.652 59.5703 108.105 54.3889 105.946 49.2922C103.786 44.1907 101.022 39.1951 97.8327 36.3347C97.7657 36.2746 97.6987 36.2145 97.6318 36.1545C93.6834 32.6123 89.9497 29.2627 85.2554 27.679C80.4919 26.0721 74.719 26.2788 66.7072 30.0155C53.8593 36.0079 44.5323 42.3063 41.4806 44.7013L41.3042 44.4704C44.3748 42.0606 53.7209 35.751 66.5867 29.7503C74.646 25.9914 80.4959 25.7657 85.3464 27.402C90.0972 29.0047 93.8698 32.3893 97.8019 35.9171Z" fill="#5F6872"/>
<path d="M43.2821 81.4884L82.7476 71.8696C94.3993 75.736 104.623 93.5968 100.789 95.6337C96.9552 97.6706 64.6123 92.1445 45.8192 92.5217C43.564 102.48 27.5899 126.471 22.9856 133.826H17.3477C18.4752 129.488 25.9173 116.286 29.7511 100.443C33.5849 84.6004 40.1813 81.0169 43.2821 81.4884Z" fill="url(#paint2_linear_16362_2161)"/>
<path d="M40.478 12.3913L57.8259 13.4927V17.8985L40.478 19V12.3913Z" fill="#5F6872"/>
<path d="M41.3045 15.6956C41.3045 17.5206 40.9347 19 40.4784 19C40.0222 19 39.6523 17.5206 39.6523 15.6956C39.6523 13.8707 40.0222 12.3913 40.4784 12.3913C40.9347 12.3913 41.3045 13.8707 41.3045 15.6956Z" fill="#D5DCE9"/>
<path d="M58.6521 15.6957C58.6521 17.0644 58.0973 18.1739 57.413 18.1739C56.7286 18.1739 56.1738 17.0644 56.1738 15.6957C56.1738 14.3269 56.7286 13.2174 57.413 13.2174C58.0973 13.2174 58.6521 14.3269 58.6521 15.6957Z" fill="#434950"/>
<path d="M31.8827 117.432C29.5246 118.047 28.497 118.875 28.1955 119.726C27.4106 121.941 31.0604 122.657 33.3578 122.058L37.3712 121.012C38.148 120.809 38.8789 120.464 39.5259 119.995L47.2513 114.392C49.2702 112.927 49.8826 110.213 48.6871 108.027C47.872 106.537 47.6933 104.789 48.1909 103.174L51.2173 93.3478L43.7016 100.274C44.712 105.469 36.3295 116.272 31.8827 117.432Z" fill="url(#paint3_linear_16362_2161)"/>
<path d="M41.1029 44.5854L40.246 48.5483L46.53 40.9056L43.9593 42.604L41.1029 44.5854Z" fill="url(#paint4_linear_16362_2161)"/>
<path d="M42.3199 21.4147C41.4532 22.6009 38.2572 30.2122 37.1738 33.8696H43.4033L45.0003 28.3329C46.0408 24.7251 48.8559 22.1627 51.2073 19.4078C53.0479 17.2512 53.6956 14.8279 53.6956 13.7046C53.6956 12.2812 52.7927 11.5299 52.3413 11.9253C52.3413 10.7391 50.4454 10.4426 50.4454 11.6288C50.4454 10.4426 48.2786 10.4426 48.2786 11.6288C48.0078 10.4426 46.3827 10.7391 46.3827 12.2218C46.6535 14.2976 46.1965 14.3479 44.7576 16.3734C42.8616 19.0423 43.4033 19.932 42.3199 21.4147Z" fill="#FFEBF0"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M52.9423 12.9407C52.6744 12.6556 52.4116 12.6309 52.2658 12.7521L52.094 12.5249C52.4073 12.2644 52.8333 12.4115 53.1393 12.7372C53.4549 13.073 53.6957 13.6361 53.6957 14.3564C53.6957 15.4829 53.0199 17.8571 51.1269 19.9623C50.667 20.4737 50.1933 20.9747 49.7195 21.4757C48.9512 22.2883 48.1829 23.1007 47.474 23.9576C46.3327 25.3368 45.3656 26.8088 44.8444 28.5239L43.22 33.8696L42.9565 33.7815L44.5809 28.4359C45.1182 26.6676 46.112 25.161 47.2651 23.7675C47.9783 22.9056 48.7602 22.0784 49.5346 21.2592C50.0069 20.7596 50.4764 20.263 50.9257 19.7633C52.7773 17.7042 53.4191 15.3989 53.4191 14.3564C53.4191 13.7024 53.2007 13.2156 52.9423 12.9407Z" fill="#EB99A2"/>
<path d="M49.0051 104.087H41.3042C42.35 96.0915 44.2134 76.5307 43.3007 62.2505C42.1599 44.4003 53.8538 50.2574 58.1321 51.3731C61.5548 52.2656 78.1926 63.6451 86.0836 69.2233L88.0802 62.2505H109.757C111.944 67.1779 114.777 79.4871 108.616 89.3048C100.915 101.577 87.2245 94.604 77.8123 87.9102C73.3259 85.0095 60.9738 72.9421 55.3586 67.2709C53.5404 78.3497 50.5409 95.4516 49.0051 104.087Z" fill="#D5DCE9"/>
<path d="M77.4183 50.9037C70.526 47.7166 69.2816 41.4391 69.3773 40.4734C61.815 44.3364 45.4841 52.5841 40.6595 54.6702C34.6288 57.2777 30.034 54.6702 31.757 47.7166C32.6503 44.1118 34.5331 35.5479 36.0647 31.7814H43.8185L40.6595 44.5296C43.7228 42.1152 53.0656 35.7797 65.9312 29.7533C81.8719 22.2865 89.0658 28.7682 97.022 35.9368L97.2336 36.1274C103.666 41.922 108.338 56.312 109.869 62.7826H88.0439C88.0439 56.988 85.5527 54.6651 77.4183 50.9037Z" fill="url(#paint5_linear_16362_2161)"/>
<path d="M61.9564 73.5217L56.1738 67.0966L56.9448 61.9565L61.9564 73.5217Z" fill="#ADB4BD"/>
<path d="M69.3911 40.7258C71.8389 50.7956 85.0654 53.1403 81.0181 47.0857C77.6524 42.0508 73.0628 39.6659 69.3911 40.7258Z" fill="url(#paint6_linear_16362_2161)"/>
<path d="M86.7393 69.276L88.598 62.7826H94.174V73.5217L86.7393 69.276Z" fill="url(#paint7_linear_16362_2161)"/>
</g>
<defs>
<linearGradient id="paint0_linear_16362_2161" x1="19.318" y1="124.601" x2="17.3039" y2="143.531" gradientUnits="userSpaceOnUse">
<stop offset="0.194766"/>
<stop offset="1" stop-color="#5F6872"/>
</linearGradient>
<linearGradient id="paint1_linear_16362_2161" x1="64.4346" y1="24.3695" x2="67.741" y2="24.632" gradientUnits="userSpaceOnUse">
<stop stop-color="#FFC5C1"/>
<stop offset="1" stop-color="#FFC5C1" stop-opacity="0"/>
</linearGradient>
<linearGradient id="paint2_linear_16362_2161" x1="82.7476" y1="82.3371" x2="-0.390015" y2="155.598" gradientUnits="userSpaceOnUse">
<stop stop-color="#A6ADB5"/>
<stop offset="1" stop-color="#D5DCE9"/>
</linearGradient>
<linearGradient id="paint3_linear_16362_2161" x1="42.3721" y1="97.5907" x2="42.0941" y2="114.845" gradientUnits="userSpaceOnUse">
<stop offset="0.194766"/>
<stop offset="1" stop-color="#5F6872"/>
</linearGradient>
<linearGradient id="paint4_linear_16362_2161" x1="39.9604" y1="43.7362" x2="43.086" y2="45.7433" gradientUnits="userSpaceOnUse">
<stop stop-color="#5F6872"/>
<stop offset="1" stop-color="#A6ADB5" stop-opacity="0"/>
</linearGradient>
<linearGradient id="paint5_linear_16362_2161" x1="92.9463" y1="71.2208" x2="91.5858" y2="37.4889" gradientUnits="userSpaceOnUse">
<stop stop-color="#A5ADBC"/>
<stop offset="1" stop-color="#CED3DC"/>
</linearGradient>
<linearGradient id="paint6_linear_16362_2161" x1="69.6971" y1="40.9908" x2="77.313" y2="52.1295" gradientUnits="userSpaceOnUse">
<stop stop-color="#5F6872"/>
<stop offset="1" stop-color="#D5DCE9" stop-opacity="0"/>
</linearGradient>
<linearGradient id="paint7_linear_16362_2161" x1="76.4844" y1="61.7836" x2="94.1198" y2="66.2438" gradientUnits="userSpaceOnUse">
<stop stop-color="#989CA0"/>
<stop offset="1" stop-color="#6F6F6F" stop-opacity="0"/>
</linearGradient>
<clipPath id="clip0_16362_2161">
<rect width="152" height="152" fill="white"/>
</clipPath>
</defs>
</svg>

          <h2 style={{ fontSize: "2rem", color: "#555", marginBottom: "1rem" }}>Essa Biblioteca está vazia :(</h2>
        </div>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: "2rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {midias.map((midia) => (
            <li
              key={midia.id}
              style={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
            >
              <img
                src={midia.img || "data:image/png;base64,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"}
                alt={midia.titulo || "Mídia sem título"}
                style={{
                  width: "100%",
                  height: "150px",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  objectFit: "cover",
                }}
              />
              <h2 style={{ fontSize: "1.5rem", color: "#333", marginBottom: "1rem" }}>{midia.titulo || "Título não informado"}</h2>
              <div style={{display: "flex", flexDirection: "column", gap: "4px"}}>

                <p style={{ fontSize: "1rem", color: "#555", marginBottom: "1rem", display: "-webkit-box",WebkitBoxOrient: "vertical", overflow: "hidden",WebkitLineClamp: 3, textOverflow: "ellipsis", }}>{midia.descricao || "Descrição não disponível"}</p>
                <p style={{ fontSize: "0.9rem", color: "#777" }}>
                    <strong>Ano:</strong> {midia.ano || "Não informado"}
                </p>
                {midia.tipo === "Livro" && midia.livro && (
                    <>
                        <p style={{ fontSize: "0.9rem", color: "#777" }}>
                            <strong>Autor:</strong> {midia.livro.autor || "Não informado"}
                        </p>
                        <p style={{ fontSize: "0.9rem", color: "#777" }}>
                            <strong>Editor:</strong> {midia.livro.editor || "Não informado"}
                        </p>
                        <p style={{ fontSize: "0.9rem", color: "#777", marginBottom: "1.5rem" }}>
                            <strong>ISBN:</strong> {midia.livro.isbn || "Não informado"}
                        </p>
                    </>
              )}
              </div>
              <button
                style={{
                  marginTop: "1rem",
                  padding: "0.5rem 1rem",
                  background: "#007BFF",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  width: "100%",
                }}
                onClick={() => handleOpenModal(midia.id, midia.titulo)}
              >
                Solicitar Empréstimo
              </button>
            </li>
          ))}
        </ul>
      )}
     {isModalOpen && (
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
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              borderRadius: "8px",
              padding: "2rem",
              width: "400px",
              textAlign: "center",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <button
              onClick={handleCloseModal}
              style={{
                position: "absolute",
                top: "10px",
                right: "1rem",
                background: "none",
                border: "none",
                fontSize: "24px",
                color: "#888",
                cursor: "pointer",
              }}
            >
              <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.9462 0.500977L6.97309 6.47407M6.97309 6.47407L1 12.4472M6.97309 6.47407L13 12.501M6.97309 6.47407L1.05379 0.554768" stroke="#5F6872" strokeLinecap="round" />
              </svg>
            </button>

            {userId ? (
              <>
                <h2>Formulário de Empréstimo</h2>
                <form>
                  <label style={{ display: "block", marginBottom: "1rem" }}>
                    Data de Retirada:
                    <input
                      type="date"
                      value={dataRetirada}
                      onChange={(e) => setDataRetirada(e.target.value)}
                      style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
                    />
                  </label>
                  <p>Obs: O tempo de empréstimo é de 30 dias após a data de retirada.</p>
                  <button
                    type="button"
                    style={{
                      marginTop: "1rem",
                      padding: "0.5rem 1rem",
                      background: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      handleCriarEmprestimo();
                    }}
                  >
                    Confirmar
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2>Você tem que estar logado para fazer empréstimo</h2>
                <button
                  type="button"
                  style={{
                    marginTop: "1rem",
                    padding: "0.5rem 1rem",
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                  onClick={() => {setIsModalOpen(false);setIsModalOpenLogin(true)}}
                >
                  Fazer Login
                </button>
              </>
            )}

          </div>
        </div>
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
  );
}

export default MediaPage;
