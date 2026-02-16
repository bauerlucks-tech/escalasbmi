import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';

// Chave de criptografia (em produção, deve vir de variável de ambiente)
const ENCRYPTION_KEY = import.meta.env.VITE_STORAGE_KEY || 'bmi-secure-storage-key-2024';

// Tipos de dados
export enum StorageType {
  SESSION = 'session', // Dados sensíveis (sessão, tokens)
  PERSISTENT = 'persistent', // Dados não sensíveis (preferências)
  TEMPORARY = 'temporary' // Dados temporários (cache)
}

class SecureStorage {
  // Criptografar dados
  private encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  }

  // Descriptografar dados
  private decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Erro ao descriptografar dados:', error);
      return '';
    }
  }

  // Armazenar dados de forma segura
  set(key: string, value: any, type: StorageType = StorageType.SESSION): void {
    const serializedValue = JSON.stringify(value);
    
    switch (type) {
      case StorageType.SESSION:
        // Dados sensíveis: sessionStorage + criptografia
        try {
          sessionStorage.setItem(key, this.encrypt(serializedValue));
        } catch (error) {
          console.error('Erro ao armazenar em sessionStorage:', error);
          // Fallback para localStorage criptografado
          localStorage.setItem(`secure_${key}`, this.encrypt(serializedValue));
        }
        break;
        
      case StorageType.PERSISTENT:
        // Dados não sensíveis: localStorage sem criptografia
        localStorage.setItem(key, serializedValue);
        break;
        
      case StorageType.TEMPORARY:
        // Dados temporários: sessionStorage sem criptografia
        try {
          sessionStorage.setItem(key, serializedValue);
        } catch (error) {
          console.error('Erro ao armazenar dados temporários:', error);
        }
        break;
    }
  }

  // Recuperar dados
  get(key: string, type: StorageType = StorageType.SESSION): any {
    let data: string | null = null;
    
    switch (type) {
      case StorageType.SESSION:
        // Tentar sessionStorage primeiro
        try {
          data = sessionStorage.getItem(key);
          if (!data) {
            // Tentar fallback no localStorage
            data = localStorage.getItem(`secure_${key}`);
          }
        } catch (error) {
          console.error('Erro ao acessar sessionStorage:', error);
          data = localStorage.getItem(`secure_${key}`);
        }
        
        if (data) {
          try {
            return JSON.parse(this.decrypt(data));
          } catch {
            // Se falhar descriptografia, tentar direto (compatibilidade)
            try {
              return JSON.parse(data);
            } catch {
              return null;
            }
          }
        }
        break;
        
      case StorageType.PERSISTENT:
        data = localStorage.getItem(key);
        break;
        
      case StorageType.TEMPORARY:
        try {
          data = sessionStorage.getItem(key);
        } catch (error) {
          console.error('Erro ao acessar sessionStorage:', error);
        }
        break;
    }
    
    return data ? JSON.parse(data) : null;
  }

  // Remover dados
  remove(key: string, type: StorageType = StorageType.SESSION): void {
    switch (type) {
      case StorageType.SESSION:
        try {
          sessionStorage.removeItem(key);
        } catch (error) {
          console.error('Erro ao remover de sessionStorage:', error);
        }
        localStorage.removeItem(`secure_${key}`);
        break;
        
      case StorageType.PERSISTENT:
        localStorage.removeItem(key);
        break;
        
      case StorageType.TEMPORARY:
        try {
          sessionStorage.removeItem(key);
        } catch (error) {
          console.error('Erro ao remover dados temporários:', error);
        }
        break;
    }
  }

  // Limpar todos os dados sensíveis
  clearSensitive(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Erro ao limpar sessionStorage:', error);
    }
    
    // Remover itens seguros do localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('secure_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Definir cookie seguro (httpOnly não é possível no frontend)
  setCookie(name: string, value: string, options?: Cookies.CookieAttributes): void {
    Cookies.set(name, value, {
      secure: true, // HTTPS only
      sameSite: 'strict', // Proteção contra CSRF
      expires: 7, // 7 dias
      ...options
    });
  }

  // Obter cookie
  getCookie(name: string): string | undefined {
    return Cookies.get(name);
  }

  // Remover cookie
  removeCookie(name: string): void {
    Cookies.remove(name);
  }
}

// Exportar instância única
export const secureStorage = new SecureStorage();

// Funções de conveniência para dados específicos
export const authStorage = {
  setUser: (user: any) => secureStorage.set('currentUser', user, StorageType.SESSION),
  getUser: () => secureStorage.get('currentUser', StorageType.SESSION),
  removeUser: () => secureStorage.remove('currentUser', StorageType.SESSION),
  
  setToken: (token: string) => secureStorage.set('authToken', token, StorageType.SESSION),
  getToken: () => secureStorage.get('authToken', StorageType.SESSION),
  removeToken: () => secureStorage.remove('authToken', StorageType.SESSION),
  
  clearAuth: () => {
    secureStorage.remove('currentUser', StorageType.SESSION);
    secureStorage.remove('authToken', StorageType.SESSION);
    secureStorage.remove('directAuth_currentUser', StorageType.SESSION);
    secureStorage.remove('directAuth_token', StorageType.SESSION);
  }
};

export const preferenceStorage = {
  set: (key: string, value: any) => secureStorage.set(key, value, StorageType.PERSISTENT),
  get: (key: string) => secureStorage.get(key, StorageType.PERSISTENT),
  remove: (key: string) => secureStorage.remove(key, StorageType.PERSISTENT)
};

export default secureStorage;
