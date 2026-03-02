// Configuração de usuários do sistema
// Este arquivo mapeia nomes de usuários para seus UUIDs correspondentes
// Em produção, considere buscar estas informações do backend ou ambiente

export interface UserMapping {
  [key: string]: string;
}

export const USER_UUIDS: UserMapping = {
  // Operadores
  'CARLOS': 'fd38b592-2986-430e-98be-d9d104d90442',
  'GUILHERME': 'b5a1b456-e837-4f47-ab41-4734a00a0355',
  'HENRIQUE': '2e7e953f-5b4e-44e9-bc69-d463a92fa99a',
  'KELLY': '9a91c13a-cf3a-4a08-af02-986163974acc',
  'LUCAS': '3826fb9b-439b-49e2-bfb5-a85e6d3aba23',
  'MATHEUS': '07935022-3fdf-4f83-907f-e57ae8831511',
  'RICARDO': 'bbad7a98-2412-43e6-8dd6-cf52fae171be',
  'ROSANA': 'd793d805-3468-4bc4-b7bf-a722b570ec98',

  // Administradores
  'ADMIN': '550e8400-299a-4d5f-8a7b-9b8e3a9b2c1f', // UUID gerado aleatoriamente
};

// Função para obter UUID de usuário
export const getUserUUID = (userName: string): string | null => {
  // Normalizar para maiúsculas para evitar problemas de case sensitivity
  const normalizedName = userName.toUpperCase();
  const uuid = USER_UUIDS[normalizedName];

  if (uuid) {
    console.log(`[DEBUG getUserUUID] "${userName}" -> "${uuid}"`);
    return uuid;
  }

  console.error(`[ERROR getUserUUID] UUID não encontrado para "${userName}"`);
  return null; // Retorna null se não encontrado
};

// Função para obter UUID do admin
export const getAdminUUID = (): string | null => {
  const adminUUID = USER_UUIDS['ADMIN'];
  if (!adminUUID) {
    console.error('[ERROR getAdminUUID] UUID de admin não encontrado');
    return null;
  }
  return adminUUID;
};

// DEBUG: Lista todos os usuários mapeados
console.log('[DEBUG] UserMapping carregado com usuários:', Object.keys(USER_UUIDS));
