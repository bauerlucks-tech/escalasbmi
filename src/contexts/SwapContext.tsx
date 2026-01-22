import { createContext, useContext, useState } from "react";
import { supabase } from "../lib/supabase";

type Escala = {
  id: string;
  data: string;
  dia_semana: string;
  posto: string;
  colaborador: {
    name: string;
  } | null;
};

type SwapContextType = {
  escalas: Escala[];
  carregarEscalas: () => Promise<void>;
};

const SwapContext = createContext<SwapContextType | null>(null);

export function SwapProvider({ children }: { children: React.ReactNode }) {
  const [escalas, setEscalas] = useState<Escala[]>([]);

  async function carregarEscalas() {
    const { data, error } = await supabase
      .from("escalas")
      .select(`
        id,
        data,
        dia_semana,
        posto,
        colaborador:profiles(name)
      `)
      .order("data");

    if (error) {
      console.error("Erro ao buscar escalas:", error);
      return;
    }

    setEscalas(data || []);
  }

  return (
    <SwapContext.Provider value={{ escalas, carregarEscalas }}>
      {children}
    </SwapContext.Provider>
  );
}

export function useSwapContext() {
  const ctx = useContext(SwapContext);
  if (!ctx) throw new Error("useSwapContext fora do Provider");
  return ctx;
}
