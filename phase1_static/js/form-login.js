// Toggle password visibility
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const emailInput = document.getElementById('email');

togglePassword.addEventListener('click', function() {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
  
  const textSpan = this.querySelector('span');
  if (type === 'text') {
    textSpan.textContent = 'Ẩn';
  } else {
    textSpan.textContent = 'Hiện';
  }
});

// === LOGIC VALIDATION FORM ===

const loginForm = document.getElementById('loginForm');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');

// THÊM MỚI: Lấy các phần tử Modal
const successModal = document.getElementById('success-modal');
const closeModalBtn = document.getElementById('modal-close-btn');

// Hàm hiển thị lỗi
function showError(inputEl, errorEl, message) {
  inputEl.classList.add('input-error');
  errorEl.textContent = message;
}

// Hàm xóa lỗi
function clearError(inputEl, errorEl) {
  inputEl.classList.remove('input-error');
  errorEl.textContent = '';
}

// Handle form submission
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  clearError(emailInput, emailError);
  clearError(passwordInput, passwordError);
  
  let isValid = true;
  
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const remember = document.getElementById('remember').checked;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (email === '') {
    showError(emailInput, emailError, 'Vui lòng nhập email');
    isValid = false;
  } else if (!emailRegex.test(email)) {
    showError(emailInput, emailError, 'Email không hợp lệ');
    isValid = false;
  }
  
  if (password === '') {
    showError(passwordInput, passwordError, 'Vui lòng nhập mật khẩu');
    isValid = false;
  }

  // CẬP NHẬT: Thay thế alert() bằng modal
  if (isValid) {
    console.log('Login attempt:', { email, password, remember });
    
    // alert('Đăng nhập thành công với email: ' + email); // CŨ
    loginForm.reset();
    
    // MỚI: Hiển thị modal
    successModal.classList.remove('hidden');
    
    // (Tùy chọn) Tự động đóng modal và chuyển trang sau vài giây
    setTimeout(() => {
      closeModal();
      // Chuyển hướng về trang chủ
        window.location.href = '../client/homepage.html';    
    }, 2000); // 5 giây
  }
});

// THÊM MỚI: Logic đóng Modal
function closeModal() {
  successModal.classList.add('hidden');
}

// Đóng khi nhấn nút "Đóng"
closeModalBtn.addEventListener('click', closeModal);
  
// Đóng khi nhấn ra ngoài vùng modal-content
successModal.addEventListener('click', function(e) {
  if (e.target === successModal) {
    closeModal();
  }
});


// Handle Google login (giữ nguyên)
const googleLoginBtn = document.getElementById('googleLogin');
googleLoginBtn.addEventListener('click', function() {
  console.log('Google login clicked');
  alert('Đăng nhập bằng Google');
});

// Handle forgot password (giữ nguyên)
const forgotPasswordLink = document.querySelector('.forgot-password');
forgotPasswordLink.addEventListener('click', function(e) {
  e.preventDefault();
  console.log('Forgot password clicked');
  alert('Quên mật khẩu');
});

