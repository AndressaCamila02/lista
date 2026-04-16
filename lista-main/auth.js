// auth.js - Módulo de Autenticação com Supabase
import { supabase } from './supabase.js';

// ===== FUNÇÕES DE AUTENTICAÇÃO =====

// Função de Login
export async function LOGIN() {
  const email = document.getElementById('email')?.value;
  const password = document.getElementById('senha')?.value;

  if (!email || !password) {
    showToast('Preencha todos os campos!', 'error');
    return;
  }

  try {
    showLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;

    console.log('✅ Login realizado:', data.user.email);
    showToast('Login realizado com sucesso!', 'success');

    // Salvar sessão no localStorage (opcional)
    localStorage.setItem('userEmail', data.user.email);

    // Redirecionar para o index
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);

  } catch (error) {
    console.error('❌ Erro no login:', error);

    let errorMessage = 'Erro ao fazer login.';
    switch (error.message) {
      case 'Invalid login credentials':
        errorMessage = 'E-mail ou senha incorretos.';
        break;
      case 'Email not confirmed':
        errorMessage = 'E-mail não confirmado. Verifique sua caixa de entrada.';
        break;
      default:
        errorMessage = error.message;
    }

    showToast(errorMessage, 'error');
  } finally {
    showLoading(false);
  }
}

// Função de Cadastro
export async function cadastro() {
  const email = document.getElementById('email')?.value;
  const password = document.getElementById('senha')?.value;

  if (!email || !password) {
    showToast('Preencha todos os campos!', 'error');
    return;
  }

  if (password.length < 6) {
    showToast('A senha deve ter pelo menos 6 caracteres.', 'warning');
    return;
  }

  try {
    showLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          // Metadados adicionais do usuário
          full_name: email.split('@')[0],
          turma: '3° SIS',
          role: 'editor'
        }
      }
    });

    if (error) throw error;

    console.log('✅ Cadastro realizado:', data.user.email);

    if (data.user.identities && data.user.identities.length === 0) {
      showToast('Este e-mail já está cadastrado!', 'warning');
    } else {
      showToast('Conta criada com sucesso! Verifique seu e-mail.', 'success');

      // Redirecionar para o login após cadastro
      setTimeout(() => {
        // Limpar campos
        document.getElementById('email').value = '';
        document.getElementById('senha').value = '';
      }, 2000);
    }

  } catch (error) {
    console.error('❌ Erro no cadastro:', error);

    let errorMessage = 'Erro ao criar conta.';
    if (error.message.includes('already registered')) {
      errorMessage = 'Este e-mail já está cadastrado.';
    } else if (error.message.includes('password')) {
      errorMessage = 'A senha não atende aos requisitos de segurança.';
    } else {
      errorMessage = error.message;
    }

    showToast(errorMessage, 'error');
  } finally {
    showLoading(false);
  }
}

// Função de Logout
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    console.log('✅ Logout realizado');
    localStorage.removeItem('userEmail');

    window.location.href = 'login.html';

  } catch (error) {
    console.error('❌ Erro no logout:', error);
    showToast('Erro ao sair.', 'error');
  }
}

// Função para recuperar senha
export async function resetPassword() {
  const email = document.getElementById('email')?.value;

  if (!email) {
    showToast('Digite seu e-mail para recuperar a senha.', 'warning');
    return;
  }

  try {
    showLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password.html'
    });

    if (error) throw error;

    showToast('E-mail de recuperação enviado! Verifique sua caixa de entrada.', 'success');

  } catch (error) {
    console.error('❌ Erro ao enviar recuperação:', error);
    showToast('Erro ao enviar e-mail de recuperação.', 'error');
  } finally {
    showLoading(false);
  }
}

// Verificar estado da autenticação
export async function checkAuthState() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) throw error;

    const currentPath = window.location.pathname;

    if (session) {
      console.log('👤 Usuário logado:', session.user.email);

      // Se estiver na página de login, redireciona para index
      if (currentPath.includes('login.html')) {
        window.location.href = 'index.html';
      }

      return session.user;
    } else {
      console.log('👤 Nenhum usuário logado');

      // Se não estiver na página de login, redireciona para login
      if (!currentPath.includes('login.html') && !currentPath.includes('reset-password')) {
        window.location.href = 'login.html';
      }

      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao verificar autenticação:', error);
    return null;
  }
}

// Obter usuário atual
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) throw error;

    return user;
  } catch (error) {
    console.error('❌ Erro ao obter usuário:', error);
    return null;
  }
}

// Atualizar perfil do usuário
export async function updateUserProfile(updates) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: updates
    });

    if (error) throw error;

    showToast('Perfil atualizado com sucesso!', 'success');
    return data.user;

  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    showToast('Erro ao atualizar perfil.', 'error');
    return null;
  }
}

// ===== FUNÇÕES AUXILIARES DE UI =====

// Toast Notification System
function showToast(message, type = 'info') {
  // Remover toast existente
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Criar elemento de toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  // Ícones para cada tipo
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;

  toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 20px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        font-size: 14px;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideDown 0.3s ease;
        max-width: 90%;
        backdrop-filter: blur(10px);
    `;

  // Definir cor baseada no tipo
  const colors = {
    success: '#2ECC71',
    error: '#E74C3C',
    warning: '#F39C12',
    info: '#3498DB'
  };
  toast.style.backgroundColor = colors[type] || colors.info;

  document.body.appendChild(toast);

  // Remover após 3-5 segundos (mais tempo para erros)
  const duration = type === 'error' ? 5000 : 3000;
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Loading State
function showLoading(show) {
  const submitBtn = document.querySelector('.btn-primary');
  const cadastroBtn = document.querySelector('.btn-secondary');

  const buttons = [submitBtn, cadastroBtn].filter(btn => btn);

  buttons.forEach(button => {
    if (show) {
      button.disabled = true;
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = `
                <span>Carregando</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1">
                        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                    </path>
                </svg>
            `;
    } else {
      button.disabled = false;
      if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
      }
    }
  });
}

// ===== INICIALIZAÇÃO =====

// Adicionar animações CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translate(-50%, -20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -20px);
        }
    }
    
    .toast-icon {
        font-size: 18px;
        font-weight: bold;
    }
    
    .toast-message {
        flex: 1;
    }
    
    .btn-primary:disabled,
    .btn-secondary:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;
document.head.appendChild(style);

// Configurar listener de mudança de autenticação
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔄 Auth state changed:', event, session?.user?.email);

  if (event === 'SIGNED_OUT') {
    console.log('👋 Usuário deslogado');
    localStorage.removeItem('userEmail');
  } else if (event === 'SIGNED_IN') {
    console.log('🎉 Usuário logado');
  }
});

// Verificar autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
  const user = await checkAuthState();

  if (user) {
    console.log('✅ Sessão ativa para:', user.email);
  }
});

// Exportar funções adicionais se necessário
export { showToast, showLoading };