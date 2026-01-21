import React, { useEffect, useState } from "react";
import { useSwapContext } from "../context/SwapContext";

const Swaps: React.FC = () => {
  const { carregarSwaps, swaps } = useSwapContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarSwaps().finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Carregando trocas...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Solicitações de Troca</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Data</th>
            <th className="border p-2">Colaborador</th>
            <th className="border p-2">Posto</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {swaps.map((swap) => (
            <tr key={swap.id}>
              <td className="border p-2">{swap.data}</td>
              <td className="border p-2">{swap.colaborador?.name}</td>
              <td className="border p-2">{swap.posto}</td>
              <td className="border p-2">{swap.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Swaps;
