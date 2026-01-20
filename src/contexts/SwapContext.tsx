// src/contexts/SwapContext.tsx

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Swap = {
  id: string;
  created_at: string;
  escala_id: string;
  solicitante: string;
  substituto: string;
  status: string;
};

type SwapContextType = {
  swaps: Swap[];
  loading: boolean;
};

const SwapContext = createContext<SwapContextType>({
  swaps: [],
  loading: true,
});

export function SwapProvider({ children }: { children: React.ReactNode }) {
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarSwaps = async () => {
      const { data, error } = await supabase
        .from("swaps")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Erro ao carregar swaps:", error);
      } else {
        setSwaps(data || []);
      }

      setLoading(false);
    };

    carregarSwaps();
  }, []);

  return (
    <SwapContext.Provider value={{ swaps, loading }}>
      {children}
    </SwapContext.Provider>
  );
}

export const useSwaps = () => useContext(SwapContext);
