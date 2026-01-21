import React, { useEffect, useState } from "react";
import { useSwapContext } from "../context/SwapContext";

const Escalas: React.FC = () => {
  const { carregarEscalas, escalas } = useSwapContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarEscalas().finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando escalas...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Escalas</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Data</th>
            <th className="border p-2">Dia da Semana</th>
            <th className="border p-2">Posto</th>
            <th className="border p-2">Colaborador</th>
          </tr>
        </thead>
        <tbody>
          {escalas.map((escala) => (
            <tr key={escala.id}>
              <td className="border p-2">{escala.data}</td>
              <td className="border p-2">{escala.dia_semana}</td>
              <td className="border p-2">{escala.posto}</td>
              <td className="border p-2">{escala.colaborador?.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Escalas;
