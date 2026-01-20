import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function Swaps() {
  const { user } = useAuth();
  const [data, setData] = useState("");
  const [swapCom, setSwapCom] = useState("");

  const solicitar = async () => {
    await supabase.from("swaps").insert({
      data,
      colaborador: user?.name,
      swap_com: swapCom,
      status: "pendente",
    });

    alert("Solicitação enviada");
  };

  return (
    <div>
      <h1>Solicitar Troca</h1>
      <input type="date" onChange={(e) => setData(e.target.value)} />
      <input placeholder="Trocar com" onChange={(e) => setSwapCom(e.target.value)} />
      <button onClick={solicitar}>Enviar</button>
    </div>
  );
}
