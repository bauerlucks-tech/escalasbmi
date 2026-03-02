const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://lsxmwwwmgfjwnowlsmzf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzeG13d3dtZ2Zqd25vd2xzbXpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkyMzM2NCwiZXhwIjoyMDg1NDk5MzY0fQ.iwOL-8oLeeYeb4BXZxXqrley453FgvJo9OEGLBDdv94';

const serviceClient = createClient(supabaseUrl, serviceRoleKey);

async function fixUserMapping() {
  console.log('🔧 CORRIGINDO USERMAPPING.TS COM UUIDS CORRETOS');
  console.log('='.repeat(60));

  try {
    // Buscar todos os usuários ativos do banco
    const { data: users, error } = await serviceClient
      .from('users')
      .select('*')
      .eq('status', 'ativo')
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar usuários:', error.message);
      return;
    }

    console.log(`✅ ${users.length} usuários ativos encontrados no banco`);

    // Criar novo userMapping baseado nos dados reais
    const newUserMapping = {};

    users.forEach(user => {
      if (user.role !== 'super_admin') { // Super admins podem não estar no mapping público
        newUserMapping[user.name] = user.id;
      }
    });

    // Adicionar super admins específicos se necessário
    const superAdminHidden = users.find(u => u.name === 'SUPER_ADMIN_HIDDEN');
    if (superAdminHidden) {
      // Não adicionar ao mapping público por segurança
    }

    // Gerar novo conteúdo do arquivo userMapping.ts
    const mappingEntries = Object.entries(newUserMapping)
      .map(([name, uuid]) => `  '${name}': '${uuid}',`)
      .join('\n');

    const newFileContent = `// Configuração de usuários do sistema
// Este arquivo mapeia nomes de usuários para seus UUIDs correspondentes
// Em produção, considere buscar estas informações do backend ou ambiente

export interface UserMapping {
  [key: string]: string;
}

export const USER_UUIDS: UserMapping = {
  // Operadores
${mappingEntries}

  // Administradores
  'ADMIN': '550e8400-299a-4d5f-8a7b-9b8e3a9b2c1f', // UUID gerado aleatoriamente
};

// Função para obter UUID de usuário
export const getUserUUID = (userName: string): string | null => {
  // Normalizar para maiúsculas para evitar problemas de case sensitivity
  const normalizedName = userName.toUpperCase();
  const uuid = USER_UUIDS[normalizedName];

  if (uuid) {
    console.log(\`[DEBUG getUserUUID] "\${userName}" -> "\${uuid}"\`);
    return uuid;
  }

  console.error(\`[ERROR getUserUUID] UUID não encontrado para "\${userName}"\`);
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
`;

    // Salvar o novo arquivo
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../src/config/userMapping.ts');

    fs.writeFileSync(filePath, newFileContent, 'utf8');

    console.log('✅ userMapping.ts atualizado com UUIDs corretos!');
    console.log(`📊 ${Object.keys(newUserMapping).length} usuários mapeados`);

    // Verificar se todos os usuários foram mapeados
    console.log('\n📋 Usuários mapeados:');
    Object.entries(newUserMapping).forEach(([name, uuid]) => {
      const user = users.find(u => u.name === name);
      console.log(`  ✅ ${name}: ${uuid} (${user ? user.role : 'N/A'})`);
    });

    // Verificar se há usuários não mapeados
    const unmappedUsers = users.filter(user =>
      !newUserMapping[user.name] && user.role !== 'super_admin'
    );

    if (unmappedUsers.length > 0) {
      console.log('\n⚠️ Usuários não mapeados:');
      unmappedUsers.forEach(user => {
        console.log(`  - ${user.name} (${user.role})`);
      });
    }

    console.log('\n🎯 userMapping.ts corrigido com sucesso!');
    console.log('🔄 Reinicie o frontend para aplicar as mudanças');

  } catch (error) {
    console.error('❌ Erro ao corrigir userMapping:', error.message);
  }
}

fixUserMapping();
