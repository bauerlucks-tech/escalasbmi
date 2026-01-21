import React, { createContext, useContext, useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface Escala {
  id: string;
  data: string;
  dia_semana: string;
  posto: string;
  colaborador?: { name: string };
}

interface Swap {
  id: string;
  data: string;
  posto: string;
  status: string;
  colaborador?: { name: string };
}

interface SwapContextType {
  escalas: Escala[];
  swaps: Swap[];
  carregarEscalas: () => Promise<void>;
  carregarSwaps: () => Promise<void>;
}

const SwapContext = createContext<SwapContextType>({} as SwapContextType);

export const SwapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [escalas, setEscalas] = useState<Escala[]>([]);
  const [swaps, setSwaps] = useState<Swap[]>([]);

  const carregarEscalas = async () => {
    const { data, error } = await supabase
      .from("escalas")
      .select("id, data, dia_semana, posto, colaborador:profiles(name)")
      .order("data", { ascending: true });

    if (error) console.error("Erro ao carregar escalas:", error);
    else setEscalas(data || []);
  };

  const carregarSwaps = async () => {
    const { data, error } = await supabase
      .from("swaps")
      .select("id, data, posto, status, colaborador:profiles(name)")
      .order("data", { ascending: true });

    if (error) console.error("Erro ao carregar swaps:", error);
    else setSwaps(data || []);
  };

  return (
    <SwapContext.Provider value={{ escalas, swaps, carregarEscalas, carregarSwaps }}>
      {children}
    </SwapContext.Provider>
  );
};

export const useSwapContext = () => useContext(SwapContext);
