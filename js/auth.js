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
    const { data: { session } } = await supabase.auth.getSession();

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
    const { error } = await supabase.auth.signOut();

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
  const userIcon = document.querySelector('.header-right .icon-link[title="로그인"]');

  if (!userIcon) return;

  if (currentUser) {
    // 로그인된 상태
    const userEmail = currentUser.email;
    const userName = userEmail.split('@')[0]; // 이메일의 @ 앞부분을 사용자명으로 사용

    userIcon.innerHTML = `
      <i class="fa-solid fa-user"></i>
    `;
    userIcon.title = userName;

    // 드롭다운 메뉴 추가
    const parent = userIcon.parentElement;

    // 기존 드롭다운이 있으면 제거
    const existingDropdown = parent.querySelector('.user-dropdown');
    if (existingDropdown) {
      existingDropdown.remove();
    }

    const dropdown = document.createElement('div');
    dropdown.className = 'user-dropdown';
    dropdown.innerHTML = `
      <div class="user-info">
        <p class="user-name">${userName}</p>
        <p class="user-email">${userEmail}</p>
      </div>
      <button onclick="logout()" class="logout-btn">로그아웃</button>
    `;

    parent.style.position = 'relative';
    parent.appendChild(dropdown);

    // 사용자 아이콘 클릭 시 드롭다운 토글
    userIcon.addEventListener('click', function(e) {
      e.preventDefault();
      dropdown.classList.toggle('show');
    });

    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener('click', function(e) {
      if (!parent.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });
  } else {
    // 로그아웃된 상태
    userIcon.href = 'login.html';
    userIcon.innerHTML = '<i class="fa-solid fa-user"></i>';
    userIcon.title = '로그인';
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
