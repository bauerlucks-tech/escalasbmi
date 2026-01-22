import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav style={{ padding: 10 }}>
      <Link to="/">Escalas</Link> |{" "}
      <Link to="/swaps">Trocas</Link>
      {(user.role === "admin" || user.role === "suser") && (
        <> | <Link to="/admin">Admin</Link></>
      )}
      <button onClick={logout} style={{ marginLeft: 20 }}>Sair</button>
    </nav>
  );
}
