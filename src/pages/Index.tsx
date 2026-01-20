// Arquivo: src/pages/Index.tsx

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

// Definição do tipo Escala
type Escala = {
  id: string;           // id da escala
  data: string;         // data da escala
  dia_semana: string;   // dia da semana
  posto: string;        // posto: meio ou fechamento
  colaborador: string | null;  // nome do colaborador
};

export default function Index() {
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarEscalas = async () => {
      console.log("🔹 Tentando buscar escalas do Supabase...");

      // Query corrigida: pega todos os campos de escalas
      const { data, error } = await supabase
        .from("escalas")
        .select("*")      // pega todos os campos, sem join
        .order("data", { ascending: true });

      if (error) {
        console.error("❌ Erro ao buscar escalas:", error);
      } else {
        console.log("✅ Escalas recebidas:", data);
        setEscalas(data || []);
      }

      setLoading(false);
    };

    carregarEscalas();
  }, []);

  if (loading) return <p>Carregando...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Escalas</h1>
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
