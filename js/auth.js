// 로그인 상태 관리
let currentUser = null;

// 페이지 로드 시 로그인 상태 확인
document.addEventListener('DOMContentLoaded', async function() {
  await checkAuth();
  updateAuthUI();
});

// 로그인 상태 확인
async function checkAuth() {
  try {
    const { data: { session } } = await window.supabaseClient.auth.getSession();

    if (session) {
      currentUser = session.user;
    } else {
      currentUser = null;
    }

    return currentUser;
  } catch (error) {
    console.error('인증 확인 에러:', error);
    currentUser = null;
    return null;
  }
}

// 로그아웃
async function logout() {
  try {
    const { error } = await window.supabaseClient.auth.signOut();

    if (error) throw error;

    currentUser = null;
    window.location.href = 'index.html';
  } catch (error) {
    console.error('로그아웃 에러:', error);
    alert('로그아웃 중 오류가 발생했습니다.');
  }
}

// UI 업데이트
function updateAuthUI() {
  const headerRight = document.querySelector('.header-right');
  const authLink = document.getElementById('authLink');

  if (!headerRight) return;

  if (currentUser) {
    // 로그인된 상태
    const userEmail = currentUser.email;
    const userName = userEmail.split('@')[0]; // 이메일의 @ 앞부분을 사용자명으로 사용

    // 기존 로그인 아이콘 숨기기
    if (authLink) {
      authLink.classList.add('hidden');
    }

    // 기존 user-info-box가 있으면 제거
    const existingUserInfo = headerRight.querySelector('.user-info-box');
    if (existingUserInfo) {
      existingUserInfo.remove();
    }

    // 새로운 사용자 정보 박스 생성
    const userInfoBox = document.createElement('div');
    userInfoBox.className = 'user-info-box';
    userInfoBox.innerHTML = `
      <span class="user-id">${userName}</span>
      <span class="divider">|</span>
      <button onclick="logout()" class="logout-link">로그아웃</button>
    `;

    // 헤더 우측에 추가
    headerRight.appendChild(userInfoBox);
  } else {
    // 로그아웃된 상태
    // 기존 user-info-box 제거
    const existingUserInfo = headerRight.querySelector('.user-info-box');
    if (existingUserInfo) {
      existingUserInfo.remove();
    }

    // 로그인 아이콘 다시 표시
    if (authLink) {
      authLink.classList.remove('hidden');
    }
  }
}

// 현재 사용자 가져오기
function getCurrentUser() {
  return currentUser;
}

// 로그인 필요 여부 확인
function requireAuth() {
  if (!currentUser) {
    alert('로그인이 필요합니다.');
    window.location.href = 'login.html';
    return false;
  }
  return true;
}
