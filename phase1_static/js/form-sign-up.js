document.addEventListener('DOMContentLoaded', function() {
  
  // === DOM Selectors ===
  const form = document.getElementById('signupForm');
  
  const fullnameInput = document.getElementById('fullname');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  
  const fullnameError = document.getElementById('fullname-error');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const confirmPasswordError = document.getElementById('confirm-password-error');
  
  const passwordHint = document.querySelector('.password-hint');
  
  const successModal = document.getElementById('success-modal');
  const closeModalBtn = document.getElementById('modal-close-btn');

  const toggleButtons = document.querySelectorAll('.toggle-password');

  // === Helper Functions ===
  
  function showError(inputEl, errorEl, message) {
    inputEl.classList.add('input-error');
    errorEl.textContent = message;
  }

  function clearError(inputEl, errorEl) {
    inputEl.classList.remove('input-error');
    errorEl.textContent = '';
  }

  function clearAllErrors() {
    clearError(fullnameInput, fullnameError);
    clearError(emailInput, emailError);
    clearError(passwordInput, passwordError);
    clearError(confirmPasswordInput, confirmPasswordError);
  }

 // === Password Toggle Functionality (ĐÃ CẬP NHẬT) ===
  toggleButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const textSpan = this.querySelector('span'); // Lấy phần tử span bên trong
      
      if (input.type === 'password') {
        input.type = 'text';
        textSpan.textContent = 'Ẩn'; // Đổi chữ thành Ẩn
      } else {
        input.type = 'password';
        textSpan.textContent = 'Hiện'; // Đổi chữ thành Hiện
      }
    });
  });

  // === Show password hint on focus ===
  passwordInput.addEventListener('focus', function() {
    passwordHint.classList.remove('hidden');
  });
  
  passwordInput.addEventListener('blur', function() {
    passwordHint.classList.add('hidden');
  });

  // === Format name on blur ===
  fullnameInput.addEventListener('blur', function() {
    let name = fullnameInput.value.trim();
    if (name) {
      const formattedName = name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      fullnameInput.value = formattedName;
    }
  });


  // === Form validation ===
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    clearAllErrors();
    
    let isValid = true;
    
    const fullname = fullnameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // ... (Validate fullname)
    if (fullname === '') {
      showError(fullnameInput, fullnameError, 'Vui lòng nhập họ và tên');
      isValid = false;
    }
    
    // ... (Validate email)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email === '') {
      showError(emailInput, emailError, 'Vui lòng nhập email');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      showError(emailInput, emailError, 'Email không hợp lệ');
      isValid = false;
    }
    
    // === Validate password (ĐÃ CẬP NHẬT) ===
    // Thêm ký tự '#' vào danh sách cho phép
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    
    if (password === '') {
      showError(passwordInput, passwordError, 'Vui lòng nhập mật khẩu');
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      showError(passwordInput, passwordError, 'Mật khẩu không đủ mạnh. Vui lòng kiểm tra lại.');
      isValid = false;
    }
    
    // ... (Validate password match)
    if (confirmPassword === '') {
      showError(confirmPasswordInput, confirmPasswordError, 'Vui lòng nhập lại mật khẩu');
      isValid = false;
    } else if (password !== confirmPassword) {
      showError(confirmPasswordInput, confirmPasswordError, 'Mật khẩu không khớp');
      isValid = false;
    }
    
    // ... (Show Success Modal)
    if (isValid) {
      console.log('Form data:', { fullname, email, password });
      form.reset();
      successModal.classList.remove('hidden');
      
      setTimeout(() => {
        closeModal();
      }, 5000);
    }
  });

  // === Modal logic ===
  function closeModal() {
    successModal.classList.add('hidden');
  }

  closeModalBtn.addEventListener('click', closeModal);
  
  successModal.addEventListener('click', function(e) {
    if (e.target === successModal) {
      closeModal();
    }
  });

  // === Login link handler ===
  const loginLink = document.querySelector('.link-login');
  loginLink.addEventListener('click', function() {
    alert('Chuyển đến trang đăng nhập');
    // window.location.href = '/login';
  });
});