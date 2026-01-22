import { useEffect } from "react";
import { useSwapContext } from "../context/SwapContext";

export default function Escalas() {
  const { escalas, carregarEscalas } = useSwapContext();

  useEffect(() => {
    carregarEscalas();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Escalas</h1>

      <table border={1} cellPadding={6}>
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
              <td>{e.colaborador?.name ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
