// Mock users for testing
export const MOCK_USERS = [
  {
    id: '673e4b8f9a1b2c3d4e5f6789',
    name: 'Usuário A',
    email: 'usuario.a@exemplo.com',
    avatar: '👨‍💼',
    role: 'Administrador'
  },
  {
    id: '673e4b8f9a1b2c3d4e5f678a', 
    name: 'Usuário B',
    email: 'usuario.b@exemplo.com',
    avatar: '👩‍💻',
    role: 'Desenvolvedor'
  },
  {
    id: '673e4b8f9a1b2c3d4e5f678b',
    name: 'Usuário C', 
    email: 'usuario.c@exemplo.com',
    avatar: '👨‍🎨',
    role: 'Designer'
  }
];

export const getUserById = (id) => {
  return MOCK_USERS.find(user => user.id === id);
};

export const getDefaultUser = () => {
  return MOCK_USERS[0]; // Usuario A como padrão
};