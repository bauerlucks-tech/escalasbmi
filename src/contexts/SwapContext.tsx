import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Swap = {
  id: string;
  data_swap: string; // renomeado para coincidir com sua coluna real
  usuario: string | null;
};

type SwapContextType = {
  swaps: Swap[];
  loading: boolean;
};

const SwapContext = createContext<SwapContextType>({ swaps: [], loading: true });

export const SwapProvider = ({ children }: { children: React.ReactNode }) => {
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarSwaps = async () => {
      console.log("🔹 Tentando buscar swaps do Supabase...");
      const { data, error } = await supabase
        .from("swaps")
        .select("*") // pega todos os campos
        .order("data_swap", { ascending: true }); // ajustado para coluna real

      if (error) {
        console.error("❌ Erro ao carregar swaps:", error);
      } else {
        console.log("✅ Swaps recebidos:", data);
        setSwaps(data || []);
      }

      setLoading(false);
    };

    carregarSwaps();
  }, []);

  return <SwapContext.Provider value={{ swaps, loading }}>{children}</SwapContext.Provider>;
};

export const useSwaps = () => useContext(SwapContext);
