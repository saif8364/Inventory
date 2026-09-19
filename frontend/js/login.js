/**
 * Login Page Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to dashboard
  if (Auth.isAuthenticated()) {
    window.location.href = '/pages/dashboard.html';
    return;
  }

  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const submitBtn = document.getElementById('submit-btn');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      Toast.error('Please fill in all fields');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Logging in...';

    try {
      const response = await api.post('/auth/login', { email, password });
      const authData = (response && response.data) ? response.data : response;
      
      if (authData && authData.token && authData.user) {
        Auth.setSession(authData.token, authData.user);
        Toast.success('Login successful! Redirecting...');
        
        setTimeout(() => {
          window.location.href = '/pages/dashboard.html';
        }, 500);
      } else {
        throw new Error('Invalid response structure from server');
      }
    } catch (err) {
      Toast.error(err.message || 'Invalid email or password');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }
  });
});
