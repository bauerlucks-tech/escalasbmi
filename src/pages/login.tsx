import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("name", name.toUpperCase())
      .eq("status", "ativo")
      .single();

    if (error || !data) {
      alert("Usuário não encontrado");
      return;
    }

    localStorage.setItem("user", JSON.stringify(data));
    navigate("/");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Login</h1>
      <input
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br /><br />
      <button onClick={login}>Entrar</button>
    </div>
  );
}
