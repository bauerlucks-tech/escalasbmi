import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Admin() {
  const [swaps, setSwaps] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("swaps").select("*").then(({ data }) => {
      setSwaps(data || []);
    });
  }, []);

  const aprovar = async (id: string) => {
    await supabase.from("swaps").update({ status: "aprovado" }).eq("id", id);
    alert("Aprovado");
  };

  return (
    <div>
      <h1>Administração</h1>
      {swaps.map(s => (
        <div key={s.id}>
          {s.data} - {s.colaborador} ⇄ {s.swap_com}
          <button onClick={() => aprovar(s.id)}>Aprovar</button>
        </div>
      ))}
    </div>
  );
}
