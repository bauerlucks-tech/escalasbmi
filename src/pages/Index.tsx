import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

type Escala = {
  id: string;
  data: string;
  dia_semana: string;
  posto: string;
  colaborador: string | null;
};

export default function Index() {
  const { user, logout } = useAuth();
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      console.log("🔹 Tentando buscar escalas do Supabase...");

      const { data, error } = await supabase
        .from("escalas")
        .select("*")
        .order("data", { ascending: true });

      if (error) {
        console.error("❌ Erro ao buscar escalas:", error);
      } else {
        setEscalas(data || []);
      }

      setLoading(false);
    };

    carregar();
  }, []);

  if (loading) return <p>Carregando...</p>;

  return (
    <div style={{ padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Escalas</h1>
        <div>
          {user?.name} ({user?.role}){" "}
          <button onClick={logout}>Sair</button>
        </div>
      </header>

      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Data</th>
            <th>Dia</th>
            <th>Posto</th>
            <th>Colaborador</th>
          </tr>
        </thead>
        <tbody>
          {escalas.map((e) => (
            <tr key={e.id}>
              <td>{e.data}</td>
              <td>{e.dia_semana}</td>
              <td>{e.posto}</td>
              <td>{e.colaborador ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
