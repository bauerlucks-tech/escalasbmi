// Configuração de usuários do sistema
// Este arquivo mapeia nomes de usuários para seus UUIDs correspondentes
// Em produção, considere buscar estas informações do backend ou ambiente

export interface UserMapping {
  [key: string]: string;
}

export const USER_UUIDS: UserMapping = {
  // Operadores
  'LUCAS': '3826fb9b-439b-49e2-bfb5-a85e6d3aba23',
  'CARLOS': 'fd38b592-2986-430e-98be-d9d104d90442',
  'ROSANA': 'd793d805-3468-4bc4-b7bf-a722b570ec98',
  'HENRIQUE': '2e7e953f-5b4e-44e9-bc69-d463a92fa99a',
  'KELLY': '9a91c13a-cf3a-4a08-af02-986163974acc',
  'GUILHERME': 'b5a1b456-e837-4f47-ab41-4734a00a0355',
  
  // Administradores
  'RICARDO': 'fd2513b2-3260-4ad2-97b1-6f5fbb88c192',
  'ADMIN': 'fd2513b2-3260-4ad2-97b1-6f5fbb88c192', // Admin genérico
};

// Função para obter UUID de usuário
export const getUserUUID = (userName: string): string => {
  // Normalizar para maiúsculas para evitar problemas de case sensitivity
  const normalizedName = userName.toUpperCase();
  const uuid = USER_UUIDS[normalizedName];
  
  if (uuid) {
    console.log(`[DEBUG getUserUUID] "${userName}" -> "${uuid}"`);
    return uuid;
  }
  
  console.warn(`[WARN getUserUUID] UUID não encontrado para "${userName}", retornando nome original`);
  return userName; // Retorna o nome se não encontrado
};

// Função para obter UUID do admin
export const getAdminUUID = (): string => {
  return USER_UUIDS['ADMIN'];
};
