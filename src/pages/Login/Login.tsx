import React from "react";

const Login: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="p-8 bg-white shadow-md rounded-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Usuário"
            className="border p-2 rounded"
          />
          <input
            type="password"
            placeholder="Senha"
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
