// 게시판 기능 관리

// DOM 요소
const postListElement = document.getElementById('postList');
const boardContainer = document.querySelector('.board-container');
const writeContainer = document.querySelector('.write-container');
const detailContainer = document.querySelector('.detail-container');

// 검색 관련 DOM 요소
const searchInputElement = document.getElementById('searchInput');
const searchBtnElement = document.getElementById('searchBtn');

// 글쓰기 관련 DOM 요소
const writeBtnElement = document.getElementById('writeBtn');
const writeFormElement = document.getElementById('writeForm');
const cancelBtnElement = document.getElementById('cancelBtn');
const postImageInput = document.getElementById('postImage');
const imagePreviewElement = document.getElementById('imagePreview');

// 상세보기 관련 DOM 요소
const detailTitleElement = document.getElementById('detailTitle');
const detailAuthorElement = document.getElementById('detailAuthor');
const detailDateElement = document.getElementById('detailDate');
const detailContentElement = document.getElementById('detailContent');
const detailImageElement = document.getElementById('detailImage');
const editBtnElement = document.getElementById('editBtn');
const deleteBtnElement = document.getElementById('deleteBtn');
const backBtnElement = document.getElementById('backBtn');

// 댓글 관련 DOM 요소
const commentFormElement = document.getElementById('commentForm');
const commentContentElement = document.getElementById('commentContent');
const commentListElement = document.getElementById('commentList');

// 페이지네이션 DOM 요소
const paginationElement = document.getElementById('pagination');

// 현재 보고 있는 게시글 정보
let currentPost = null;

// 수정 모드 여부
let isEditMode = false;

// 선택된 이미지 파일
let selectedImageFile = null;

// 페이징 관련 변수
const POSTS_PER_PAGE = 10; // 페이지당 게시글 수
let currentPage = 1; // 현재 페이지
let totalPosts = 0; // 전체 게시글 수
let totalPages = 0; // 전체 페이지 수
let isSearchMode = false; // 검색 모드 여부
let currentSearchKeyword = ''; // 현재 검색어

// 현재 로그인한 사용자 정보 (auth.js에서 전역 변수로 선언됨)
// let currentUser 는 auth.js에 이미 선언되어 있으므로 여기서는 사용만 함

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', async () => {
  // auth.js에서 이미 로그인 상태를 확인하므로 여기서는 바로 사용
  // currentUser는 auth.js의 checkAuth()에서 이미 설정됨

  // 게시글 목록 로드
  await loadPosts();

  // 이벤트 리스너 등록
  initEventListeners();
});

// 이벤트 리스너 초기화
function initEventListeners() {
  // 검색 버튼 클릭
  searchBtnElement.addEventListener('click', searchPosts);

  // 검색창에서 Enter 키 입력
  searchInputElement.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      searchPosts();
    }
  });

  // 글쓰기 버튼 클릭
  writeBtnElement.addEventListener('click', showWriteForm);

  // 글쓰기 폼 제출
  writeFormElement.addEventListener('submit', createPost);

  // 취소 버튼 클릭
  cancelBtnElement.addEventListener('click', hideWriteForm);

  // 이미지 파일 선택 시 미리보기
  postImageInput.addEventListener('change', handleImageSelect);

  // 목록으로 돌아가기 버튼 클릭
  backBtnElement.addEventListener('click', () => {
    showView('list');
  });

  // 수정 버튼 클릭
  editBtnElement.addEventListener('click', showEditForm);

  // 삭제 버튼 클릭
  deleteBtnElement.addEventListener('click', deletePost);

  // 댓글 폼 제출
  commentFormElement.addEventListener('submit', createComment);
}

// 게시글 목록 불러오기
async function loadPosts(page = 1) {
  try {
    // 검색 모드 해제
    isSearchMode = false;
    currentSearchKeyword = '';
    currentPage = page;

    // 로딩 상태 표시
    postListElement.innerHTML = '<tr><td colspan="5" style="text-align: center;">게시글을 불러오는 중...</td></tr>';

    // 전체 게시글 수 가져오기
    const { count, error: countError } = await window.supabaseClient
      .from('posts')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    totalPosts = count || 0;
    totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

    // 페이지에 해당하는 게시글 가져오기 (LIMIT, OFFSET 사용)
    const from = (page - 1) * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    const { data: posts, error } = await window.supabaseClient
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    // 게시글 표시
    displayPosts(posts);

    // 페이지네이션 표시
    renderPagination();

  } catch (error) {
    console.error('게시글 로드 에러:', error);
    postListElement.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">게시글을 불러오는데 실패했습니다.</td></tr>';
  }
}

// 게시글 목록 화면에 표시
function displayPosts(posts) {
  // 게시글이 없을 때
  if (!posts || posts.length === 0) {
    postListElement.innerHTML = '<tr><td colspan="5" style="text-align: center;">작성된 게시글이 없습니다.</td></tr>';
    return;
  }

  // 게시글 목록 생성
  postListElement.innerHTML = posts.map((post, index) => `
    <tr>
      <td>${posts.length - index}</td>
      <td class="post-title" data-id="${post.id}">${post.title}</td>
      <td>${getUserEmail(post.user_id)}</td>
      <td>${formatDate(post.created_at)}</td>
      <td>${post.views || 0}</td>
    </tr>
  `).join('');

  // 제목 클릭 이벤트 추가 (상세보기)
  document.querySelectorAll('.post-title').forEach(titleElement => {
    titleElement.style.cursor = 'pointer';
    titleElement.addEventListener('click', async (e) => {
      const postId = e.target.dataset.id;
      await showPostDetail(postId);
    });
  });
}

// 사용자 이메일 가져오기 (임시로 user_id 표시)
function getUserEmail(userId) {
  // TODO: 나중에 users 테이블과 조인하여 실제 이메일 가져오기
  return userId.substring(0, 8) + '...';
}

// 날짜 포맷팅
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// ===== 검색 기능 =====

// 게시글 검색
async function searchPosts(page = 1) {
  try {
    const searchKeyword = searchInputElement.value.trim();

    // 검색어가 없으면 전체 목록으로 돌아감
    if (!searchKeyword) {
      isSearchMode = false;
      currentSearchKeyword = '';
      await loadPosts(1);
      return;
    }

    // 검색 모드 활성화
    isSearchMode = true;
    currentSearchKeyword = searchKeyword;
    currentPage = page;

    // 로딩 상태 표시
    postListElement.innerHTML = '<tr><td colspan="5" style="text-align: center;">검색 중...</td></tr>';

    // 검색 결과 전체 개수 가져오기
    const { count, error: countError } = await window.supabaseClient
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .ilike('title', `%${searchKeyword}%`);

    if (countError) {
      throw countError;
    }

    totalPosts = count || 0;
    totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

    // 페이지에 해당하는 검색 결과 가져오기
    const from = (page - 1) * POSTS_PER_PAGE;
    const to = from + POSTS_PER_PAGE - 1;

    const { data: posts, error } = await window.supabaseClient
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .ilike('title', `%${searchKeyword}%`)
      .range(from, to);

    if (error) {
      throw error;
    }

    // 검색 결과 표시
    if (!posts || posts.length === 0) {
      postListElement.innerHTML = '<tr><td colspan="5" style="text-align: center;">검색 결과가 없습니다.</td></tr>';
      paginationElement.innerHTML = '';
      return;
    }

    displayPosts(posts);
    renderPagination();

  } catch (error) {
    console.error('게시글 검색 에러:', error);
    postListElement.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">검색 중 오류가 발생했습니다.</td></tr>';
  }
}

// ===== 이미지 처리 기능 =====

// 이미지 파일 선택 처리
function handleImageSelect(e) {
  const file = e.target.files[0];

  // 파일이 선택되지 않았으면 미리보기 초기화
  if (!file) {
    selectedImageFile = null;
    imagePreviewElement.innerHTML = '';
    return;
  }

  // 파일 크기 체크 (5MB 제한)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    alert('이미지 파일 크기는 5MB 이하여야 합니다.');
    postImageInput.value = '';
    selectedImageFile = null;
    imagePreviewElement.innerHTML = '';
    return;
  }

  // 이미지 파일인지 확인
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일만 업로드할 수 있습니다.');
    postImageInput.value = '';
    selectedImageFile = null;
    imagePreviewElement.innerHTML = '';
    return;
  }

  // 선택된 파일 저장
  selectedImageFile = file;

  // 이미지 미리보기
  const reader = new FileReader();
  reader.onload = function(e) {
    imagePreviewElement.innerHTML = `
      <div style="margin-top: 10px; position: relative; display: inline-block;">
        <img src="${e.target.result}" alt="미리보기" style="max-width: 300px; max-height: 300px; border: 1px solid #ddd; border-radius: 4px;">
        <button type="button" id="removeImageBtn" style="position: absolute; top: 5px; right: 5px; background: rgba(255,0,0,0.8); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 16px; line-height: 1;">&times;</button>
      </div>
    `;

    // 이미지 삭제 버튼 이벤트
    document.getElementById('removeImageBtn').addEventListener('click', removeImage);
  };
  reader.readAsDataURL(file);
}

// 이미지 미리보기 삭제
function removeImage() {
  selectedImageFile = null;
  postImageInput.value = '';
  imagePreviewElement.innerHTML = '';
}

// Supabase Storage에 이미지 업로드
async function uploadImage(file, userId) {
  try {
    // 파일명 생성 (중복 방지를 위해 타임스탬프 포함)
    const timestamp = Date.now();
    const fileName = `${userId}_${timestamp}_${file.name}`;

    // Supabase Storage에 업로드
    const { data, error } = await window.supabaseClient.storage
      .from('post-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // 업로드된 이미지의 공개 URL 가져오기
    const { data: urlData } = window.supabaseClient.storage
      .from('post-images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;

  } catch (error) {
    console.error('이미지 업로드 에러:', error);
    throw error;
  }
}

// Supabase Storage에서 이미지 삭제
async function deleteImage(imageUrl) {
  try {
    // URL에서 파일명 추출
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    // Supabase Storage에서 삭제
    const { error } = await window.supabaseClient.storage
      .from('post-images')
      .remove([fileName]);

    if (error) {
      throw error;
    }

  } catch (error) {
    console.error('이미지 삭제 에러:', error);
    // 이미지 삭제 실패는 치명적이지 않으므로 에러를 던지지 않음
  }
}

// ===== 글쓰기 기능 =====

// 글쓰기 폼 표시
function showWriteForm() {
  console.log('글쓰기 버튼 클릭됨');
  console.log('현재 사용자:', currentUser);

  // 로그인 확인
  if (!currentUser) {
    alert('로그인이 필요합니다.');
    window.location.href = 'login.html';
    return;
  }

  // 수정 모드 해제
  isEditMode = false;

  // 폼 제목 변경
  document.querySelector('.write-container h2').textContent = '게시글 작성';

  // 뷰 전환
  showView('write');
  console.log('글쓰기 폼 표시 완료');
}

// 글쓰기 폼 숨기기
function hideWriteForm() {
  // 폼 초기화
  writeFormElement.reset();
  selectedImageFile = null;
  imagePreviewElement.innerHTML = '';

  // 수정 모드 해제
  isEditMode = false;

  // 폼 제목 원래대로
  document.querySelector('.write-container h2').textContent = '게시글 작성';

  // 뷰 전환
  showView('list');
}

// 게시글 작성 또는 수정
async function createPost(e) {
  e.preventDefault();

  // 로그인 확인
  if (!currentUser) {
    alert('로그인이 필요합니다.');
    window.location.href = 'login.html';
    return;
  }

  // 폼 데이터 가져오기
  const title = document.getElementById('postTitle').value.trim();
  const content = document.getElementById('postContent').value.trim();

  // 유효성 검사
  if (!title || !content) {
    alert('제목과 내용을 입력해주세요.');
    return;
  }

  try {
    let imageUrl = null;

    // 이미지가 선택되었으면 업로드
    if (selectedImageFile) {
      imageUrl = await uploadImage(selectedImageFile, currentUser.id);
    }

    if (isEditMode) {
      // 수정 모드: UPDATE
      await updatePost(title, content, imageUrl);
    } else {
      // 작성 모드: INSERT
      const postData = {
        title: title,
        content: content,
        user_id: currentUser.id
      };

      // 이미지 URL이 있으면 추가
      if (imageUrl) {
        postData.image_url = imageUrl;
      }

      const { data, error } = await window.supabaseClient
        .from('posts')
        .insert([postData])
        .select();

      if (error) {
        throw error;
      }

      alert('게시글이 작성되었습니다.');
    }

    // 폼 초기화
    writeFormElement.reset();
    selectedImageFile = null;
    imagePreviewElement.innerHTML = '';
    isEditMode = false;

    // 목록으로 돌아가기
    showView('list');

    // 게시글 목록 새로고침
    await loadPosts();

  } catch (error) {
    console.error('게시글 작성 에러:', error);
    alert('게시글 작성에 실패했습니다: ' + error.message);
  }
}

// 뷰 전환 (list, write, detail)
function showView(viewName) {
  // 모든 컨테이너 숨기기
  boardContainer.style.display = 'none';
  writeContainer.style.display = 'none';
  detailContainer.style.display = 'none';

  // 선택한 뷰만 표시
  switch (viewName) {
    case 'list':
      boardContainer.style.display = 'block';
      break;
    case 'write':
      writeContainer.style.display = 'block';
      break;
    case 'detail':
      detailContainer.style.display = 'block';
      break;
  }
}

// ===== 수정 기능 =====

// 게시글 수정 폼 표시
function showEditForm() {
  // 로그인 확인
  if (!currentUser) {
    alert('로그인이 필요합니다.');
    return;
  }

  // 본인 글인지 확인
  if (!currentPost || currentPost.user_id !== currentUser.id) {
    alert('본인이 작성한 글만 수정할 수 있습니다.');
    return;
  }

  // 수정 모드 활성화
  isEditMode = true;

  // 폼에 기존 데이터 채우기
  document.getElementById('postTitle').value = currentPost.title;
  document.getElementById('postContent').value = currentPost.content;

  // 기존 이미지가 있으면 미리보기 표시
  if (currentPost.image_url) {
    imagePreviewElement.innerHTML = `
      <div style="margin-top: 10px;">
        <p style="color: #666; font-size: 14px;">기존 이미지:</p>
        <img src="${currentPost.image_url}" alt="기존 이미지" style="max-width: 300px; max-height: 300px; border: 1px solid #ddd; border-radius: 4px;">
        <p style="color: #999; font-size: 12px; margin-top: 5px;">새 이미지를 선택하면 기존 이미지가 교체됩니다.</p>
      </div>
    `;
  }

  // 폼 제목 변경
  document.querySelector('.write-container h2').textContent = '게시글 수정';

  // 뷰 전환
  showView('write');
}

// 게시글 수정
async function updatePost(title, content, newImageUrl) {
  try {
    const updateData = {
      title: title,
      content: content,
      updated_at: new Date().toISOString()
    };

    // 새 이미지가 업로드되었으면
    if (newImageUrl) {
      // 기존 이미지가 있으면 삭제
      if (currentPost.image_url) {
        await deleteImage(currentPost.image_url);
      }
      // 새 이미지 URL 저장
      updateData.image_url = newImageUrl;
    }

    const { data, error } = await window.supabaseClient
      .from('posts')
      .update(updateData)
      .eq('id', currentPost.id)
      .select();

    if (error) {
      throw error;
    }

    alert('게시글이 수정되었습니다.');

  } catch (error) {
    console.error('게시글 수정 에러:', error);
    throw error;
  }
}

// ===== 삭제 기능 =====

// 게시글 삭제
async function deletePost() {
  // 로그인 확인
  if (!currentUser) {
    alert('로그인이 필요합니다.');
    return;
  }

  // 본인 글인지 확인
  if (!currentPost || currentPost.user_id !== currentUser.id) {
    alert('본인이 작성한 글만 삭제할 수 있습니다.');
    return;
  }

  // 삭제 확인
  if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) {
    return;
  }

  try {
    // 이미지가 있으면 먼저 삭제
    if (currentPost.image_url) {
      await deleteImage(currentPost.image_url);
    }

    // 게시글 삭제
    const { error } = await window.supabaseClient
      .from('posts')
      .delete()
      .eq('id', currentPost.id);

    if (error) {
      throw error;
    }

    alert('게시글이 삭제되었습니다.');

    // 목록으로 돌아가기
    showView('list');

    // 게시글 목록 새로고침
    await loadPosts();

  } catch (error) {
    console.error('게시글 삭제 에러:', error);
    alert('게시글 삭제에 실패했습니다: ' + error.message);
  }
}

// ===== 상세보기 기능 =====

// 게시글 상세보기
async function showPostDetail(postId) {
  try {
    // 조회수 증가
    await incrementViews(postId);

    // Supabase에서 게시글 가져오기 (조회수 증가 후)
    const { data: post, error } = await window.supabaseClient
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error) {
      throw error;
    }

    if (!post) {
      alert('게시글을 찾을 수 없습니다.');
      return;
    }

    // 현재 게시글 저장
    currentPost = post;

    // 상세 정보 표시
    detailTitleElement.textContent = post.title;
    detailAuthorElement.textContent = '작성자: ' + getUserEmail(post.user_id);
    detailDateElement.textContent = '작성일: ' + formatDate(post.created_at);
    detailContentElement.textContent = post.content;

    // 이미지 표시 (이미지가 있을 경우)
    if (post.image_url) {
      detailImageElement.innerHTML = `<img src="${post.image_url}" alt="게시글 이미지" style="max-width: 100%; height: auto;">`;
    } else {
      detailImageElement.innerHTML = '';
    }

    // 본인 글인지 확인하여 수정/삭제 버튼 표시
    if (currentUser && currentUser.id === post.user_id) {
      editBtnElement.style.display = 'inline-block';
      deleteBtnElement.style.display = 'inline-block';
    } else {
      editBtnElement.style.display = 'none';
      deleteBtnElement.style.display = 'none';
    }

    // 뷰 전환
    showView('detail');

    // 댓글 목록 불러오기
    await loadComments(postId);

  } catch (error) {
    console.error('게시글 로드 에러:', error);
    alert('게시글을 불러오는데 실패했습니다: ' + error.message);
  }
}

// 조회수 증가
async function incrementViews(postId) {
  try {
    // 현재 조회수 가져오기
    const { data: post, error: fetchError } = await window.supabaseClient
      .from('posts')
      .select('views')
      .eq('id', postId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    // 조회수 1 증가
    const newViews = (post.views || 0) + 1;

    // 조회수 업데이트
    const { error: updateError } = await window.supabaseClient
      .from('posts')
      .update({ views: newViews })
      .eq('id', postId);

    if (updateError) {
      throw updateError;
    }

  } catch (error) {
    console.error('조회수 증가 에러:', error);
    // 조회수 증가 실패는 치명적이지 않으므로 에러를 던지지 않음
  }
}

// ===== 댓글 기능 =====

// 댓글 목록 불러오기
async function loadComments(postId) {
  try {
    const { data: comments, error } = await window.supabaseClient
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    displayComments(comments || []);

  } catch (error) {
    console.error('댓글 로드 에러:', error);
    commentListElement.innerHTML = '<p style="color: red;">댓글을 불러오는데 실패했습니다.</p>';
  }
}

// 댓글 목록 화면에 표시
function displayComments(comments) {
  if (!comments || comments.length === 0) {
    commentListElement.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">첫 댓글을 작성해보세요!</p>';
    return;
  }

  commentListElement.innerHTML = comments.map(comment => `
    <div class="comment-item" data-comment-id="${comment.id}">
      <div class="comment-header">
        <span class="comment-author">${getUserEmail(comment.user_id)}</span>
        <span class="comment-date">${formatDate(comment.created_at)}</span>
      </div>
      <div class="comment-content">${comment.content}</div>
      ${currentUser && currentUser.id === comment.user_id ? `
        <button class="btn-delete-comment" data-comment-id="${comment.id}">삭제</button>
      ` : ''}
    </div>
  `).join('');

  // 댓글 삭제 버튼 이벤트 추가
  document.querySelectorAll('.btn-delete-comment').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const commentId = e.target.dataset.commentId;
      await deleteComment(commentId);
    });
  });
}

// 댓글 작성
async function createComment(e) {
  e.preventDefault();

  // 로그인 확인
  if (!currentUser) {
    alert('로그인이 필요합니다.');
    return;
  }

  const content = commentContentElement.value.trim();

  if (!content) {
    alert('댓글 내용을 입력해주세요.');
    return;
  }

  try {
    const { data, error } = await window.supabaseClient
      .from('comments')
      .insert([
        {
          post_id: currentPost.id,
          content: content,
          user_id: currentUser.id
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    // 댓글 입력창 초기화
    commentContentElement.value = '';

    // 댓글 목록 새로고침
    await loadComments(currentPost.id);

  } catch (error) {
    console.error('댓글 작성 에러:', error);
    alert('댓글 작성에 실패했습니다: ' + error.message);
  }
}

// 댓글 삭제
async function deleteComment(commentId) {
  if (!confirm('정말 이 댓글을 삭제하시겠습니까?')) {
    return;
  }

  try {
    const { error } = await window.supabaseClient
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      throw error;
    }

    // 댓글 목록 새로고침
    await loadComments(currentPost.id);

  } catch (error) {
    console.error('댓글 삭제 에러:', error);
    alert('댓글 삭제에 실패했습니다: ' + error.message);
  }
}

// ===== 페이지네이션 기능 =====

// 페이지네이션 렌더링
function renderPagination() {
  if (totalPages <= 1) {
    paginationElement.innerHTML = '';
    return;
  }

  // 검색 모드인지 일반 모드인지에 따라 호출할 함수 결정
  const pageFunction = isSearchMode ? 'searchPosts' : 'loadPosts';

  let paginationHTML = '';

  // 이전 버튼
  if (currentPage > 1) {
    paginationHTML += `<button class="page-btn" onclick="${pageFunction}(${currentPage - 1})">이전</button>`;
  } else {
    paginationHTML += `<button class="page-btn disabled" disabled>이전</button>`;
  }

  // 페이지 번호 버튼 (최대 5개 표시)
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);

  for (let i = startPage; i <= endPage; i++) {
    if (i === currentPage) {
      paginationHTML += `<button class="page-btn active">${i}</button>`;
    } else {
      paginationHTML += `<button class="page-btn" onclick="${pageFunction}(${i})">${i}</button>`;
    }
  }

  // 다음 버튼
  if (currentPage < totalPages) {
    paginationHTML += `<button class="page-btn" onclick="${pageFunction}(${currentPage + 1})">다음</button>`;
  } else {
    paginationHTML += `<button class="page-btn disabled" disabled>다음</button>`;
  }

  paginationElement.innerHTML = paginationHTML;
}
