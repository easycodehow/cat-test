// 로그인/회원가입 폼 관리
document.addEventListener('DOMContentLoaded', function() {
  const loginFormContainer = document.getElementById('loginFormContainer');
  const signupFormContainer = document.getElementById('signupFormContainer');
  const showSignupBtn = document.getElementById('showSignup');
  const showLoginBtn = document.getElementById('showLogin');

  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  const loginError = document.getElementById('loginError');
  const signupError = document.getElementById('signupError');
  const signupSuccess = document.getElementById('signupSuccess');

  // 이미 로그인되어 있으면 메인 페이지로 리디렉션
  checkAuthAndRedirect();

  // 회원가입 폼 표시
  showSignupBtn.addEventListener('click', function(e) {
    e.preventDefault();
    loginFormContainer.style.display = 'none';
    signupFormContainer.style.display = 'block';
    // 에러 메시지 초기화
    hideMessage(loginError);
    hideMessage(signupError);
    hideMessage(signupSuccess);
  });

  // 로그인 폼 표시
  showLoginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    signupFormContainer.style.display = 'none';
    loginFormContainer.style.display = 'block';
    // 에러 메시지 초기화
    hideMessage(loginError);
    hideMessage(signupError);
    hideMessage(signupSuccess);
  });

  // 로그인 폼 제출
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) throw error;

      // 로그인 성공
      console.log('로그인 성공:', data);
      window.location.href = 'index.html';
    } catch (error) {
      console.error('로그인 에러:', error);
      showMessage(loginError, getErrorMessage(error));
    }
  });

  // 회원가입 폼 제출
  signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;

    // 비밀번호 확인
    if (password !== passwordConfirm) {
      showMessage(signupError, '비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 길이 확인
    if (password.length < 6) {
      showMessage(signupError, '비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
      });

      if (error) throw error;

      // 회원가입 성공
      console.log('회원가입 성공:', data);
      hideMessage(signupError);
      showMessage(signupSuccess, '회원가입이 완료되었습니다! 로그인해주세요.');

      // 폼 초기화
      signupForm.reset();

      // 3초 후 로그인 폼으로 전환
      setTimeout(() => {
        signupFormContainer.style.display = 'none';
        loginFormContainer.style.display = 'block';
        hideMessage(signupSuccess);
      }, 3000);
    } catch (error) {
      console.error('회원가입 에러:', error);
      showMessage(signupError, getErrorMessage(error));
    }
  });

  // 메시지 표시 함수
  function showMessage(element, message) {
    element.textContent = message;
    element.style.display = 'block';
  }

  // 메시지 숨김 함수
  function hideMessage(element) {
    element.style.display = 'none';
    element.textContent = '';
  }

  // 에러 메시지 변환 함수
  function getErrorMessage(error) {
    const errorMessages = {
      'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
      'Email not confirmed': '이메일 인증이 필요합니다.',
      'User already registered': '이미 가입된 이메일입니다.',
      'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다.'
    };

    return errorMessages[error.message] || error.message || '오류가 발생했습니다. 다시 시도해주세요.';
  }

  // 로그인 상태 확인 및 리디렉션
  async function checkAuthAndRedirect() {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // 이미 로그인되어 있으면 메인 페이지로
      window.location.href = 'index.html';
    }
  }
});
