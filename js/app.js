/**
 * CrewUp MVP 랜딩페이지 스크립트 (Vanilla ES6+)
 * - 전역 변수 오염을 방지하기 위해 DOMContentLoaded 내부에서 모듈형으로 실행합니다.
 * - 포함 기능:
 *   1) 모바일 햄버거 네비게이션 토글
 *   2) 현재 시간 기준 3일 뒤 자정 마감 실시간 카운트다운 타이머
 *   3) 30초 성향 진단 미니 테스트 (상태 기반 인터랙티브 퀴즈)
 *   4) 테마별 모임 카드 렌더링 & 탭 필터링
 *   5) 보증금 환급 시뮬레이터 (실시간 계산기)
 *   6) 아코디언 FAQ
 *   7) 사전 신청 모달 & 폼 정규식 검증 + localStorage 수요 데이터 저장 (Fake-door Test)
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ========================================================================
     [공통 데이터] 모임 카드 4종 데이터 배열
  ======================================================================== */
  const CREW_DATA = [
    {
      id: 'crew-1',
      category: '커리어·갓생',
      title: '퇴근 후 2시간 온라인 모각코 & 사이드프로젝트 크루',
      schedule: '매주 화·목 밤 21:00 ~ 23:00 (디스코드 캠/화면 공유)',
      spotsLeft: 2,
      progress: 80,
      badgeClass: 'badge-indigo'
    },
    {
      id: 'crew-2',
      category: '재테크·절약',
      title: '2주 만원 무지출 & 냉장고 파먹기 인증 챌린지',
      schedule: '매일 저녁 22:00 가계부 및 식단 사진 인증 (온라인)',
      spotsLeft: 3,
      progress: 70,
      badgeClass: 'badge-coral'
    },
    {
      id: 'crew-3',
      category: '취향·네트워킹',
      title: '주말 오전 10시 무소음 독서 & 인사이트 커피챗',
      schedule: '매주 토요일 오전 10:00 ~ 12:30 (성수·강남 라운지)',
      spotsLeft: 1,
      progress: 90,
      badgeClass: 'badge-indigo'
    },
    {
      id: 'crew-4',
      category: '커리어·갓생',
      title: '하루 30분 AI 툴(ChatGPT·노션) 실무 활용 7일 챌린지',
      schedule: '매일 미션 프롬프트 제공 & 결과물 인증 (온라인)',
      spotsLeft: 4,
      progress: 60,
      badgeClass: 'badge-indigo'
    }
  ];

  /* ========================================================================
     [그로스 해킹 유틸] 테마별 관심 클릭 카운트 localStorage 트래킹 함수
  ======================================================================== */
  const trackCrewInterest = (crewTitle) => {
    const STORAGE_KEY = 'crewup_click_counts';
    const currentCounts = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    currentCounts[crewTitle] = (currentCounts[crewTitle] || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentCounts));
  };

  /* ========================================================================
     1. 모바일 햄버거 메뉴 토글 기능
  ======================================================================== */
  const initMobileMenu = () => {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mainNav = document.getElementById('mainNav');
    const navLinks = mainNav.querySelectorAll('.nav-link');

    if (!menuBtn || !mainNav) return;

    menuBtn.addEventListener('click', () => {
      const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!isExpanded));
      mainNav.classList.toggle('open');
    });

    // 메뉴 항목 클릭 시 모바일 메뉴 자동 닫기
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        menuBtn.setAttribute('aria-expanded', 'false');
        mainNav.classList.remove('open');
      });
    });
  };

  /* ========================================================================
     2. 실시간 마감 카운트다운 타이머 (현재 시간 기준 3일 뒤 자정까지)
  ======================================================================== */
  const initCountdown = () => {
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');

    // 현재 시점으로부터 3일 뒤 자정(23:59:59) 설정
    const now = new Date();
    const targetDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 3,
      23, 59, 59
    );

    const padZero = (num) => String(num).padStart(2, '0');

    const updateTimer = () => {
      const currentTime = new Date().getTime();
      const diff = targetDate.getTime() - currentTime;

      if (diff <= 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      daysEl.textContent = padZero(days);
      hoursEl.textContent = padZero(hours);
      minutesEl.textContent = padZero(minutes);
      secondsEl.textContent = padZero(seconds);
    };

    updateTimer(); // 초기 즉시 실행
    setInterval(updateTimer, 1000); // 1초마다 갱신
  };

  /* ========================================================================
     3. 30초 성향 진단 미니 테스트 (인터랙티브 퀴즈)
  ======================================================================== */
  const initQuiz = () => {
    const QUESTIONS = [
      {
        step: 1,
        question: 'Q1. 모임이나 챌린지에 참여하기 가장 좋은 시간대는 언제인가요?',
        options: [
          { label: '🌙 퇴근 후 집중이 잘 되는 평일 저녁', value: 'weekday' },
          { label: '☀️ 여유롭게 하루를 여는 주말 오전', value: 'weekend' }
        ]
      },
      {
        step: 2,
        question: 'Q2. 이번 달 가장 달성하고 싶은 핵심 목표는 무엇인가요?',
        options: [
          { label: '💻 코딩·사이드프로젝트·AI 실무 역량 레벨업', value: 'career' },
          { label: '💰 식비 방어·무지출 챌린지로 시드머니 모으기', value: 'finance' },
          { label: '📚 독서와 깊이 있는 대화로 인사이트 넓히기', value: 'networking' }
        ]
      },
      {
        step: 3,
        question: 'Q3. 어떤 방식으로 크루원들과 함께하고 싶으신가요?',
        options: [
          { label: '🏠 집에서 편하게 참여하는 온라인 실시간 인증', value: 'online' },
          { label: '☕ 감각적인 라운지에서 만나는 오프라인 모임', value: 'offline' }
        ]
      }
    ];

    // 퀴즈 상태 관리 객체
    const quizState = {
      currentIndex: 0,
      answers: []
    };

    const stepTextEl = document.getElementById('quizStepText');
    const progressBarEl = document.getElementById('quizProgressBar');
    const questionBoxEl = document.getElementById('quizQuestionBox');
    const questionTitleEl = document.getElementById('quizQuestionTitle');
    const optionsListEl = document.getElementById('quizOptionsList');
    const resultBoxEl = document.getElementById('quizResultBox');
    const resultTitleEl = document.getElementById('quizResultTitle');
    const resultDescEl = document.getElementById('quizResultDesc');
    const applyBtnEl = document.getElementById('quizApplyBtn');
    const retryBtnEl = document.getElementById('quizRetryBtn');

    // 현재 질문 렌더링 함수
    const renderQuestion = () => {
      const currentQ = QUESTIONS[quizState.currentIndex];
      const progressPercent = ((quizState.currentIndex + 1) / QUESTIONS.length) * 100;

      stepTextEl.textContent = `질문 ${currentQ.step} / ${QUESTIONS.length}`;
      progressBarEl.style.width = `${progressPercent}%`;
      questionTitleEl.textContent = currentQ.question;

      // 선택지 버튼 생성 (dataset 활용)
      optionsListEl.innerHTML = currentQ.options
        .map(
          (opt) => `
          <button type="button" class="quiz-option-btn" data-answer="${opt.value}">
            <span>${opt.label}</span>
            <span aria-hidden="true">&rarr;</span>
          </button>
        `
        )
        .join('');
    };

    // 응답 조합에 따른 맞춤형 추천 모임 도출 함수
    const getRecommendation = (answers) => {
      const [timePref, goalPref, modePref] = answers;

      if (goalPref === 'finance') {
        return {
          title: '2주 만원 무지출 & 냉장고 파먹기 인증 챌린지',
          desc: '지출 통제가 시급한 당신에게 딱! 매일 저녁 크루원들과 식단 및 가계부를 유쾌하게 인증하며 2주간 식비를 완벽 방어합니다.'
        };
      }

      if (goalPref === 'networking' || timePref === 'weekend' || modePref === 'offline') {
        return {
          title: '주말 오전 10시 무소음 독서 & 인사이트 커피챗',
          desc: '주말 아침을 의미 있게 시작하고 싶은 당신에게 추천! 몰입 독서 후 결이 맞는 2030 동료들과 밀도 높은 대화를 나눕니다.'
        };
      }

      if (goalPref === 'career' && timePref === 'weekday') {
        return {
          title: '퇴근 후 2시간 온라인 모각코 & 사이드프로젝트 크루',
          desc: '퇴근 후 늘어지기 쉬운 저녁 시간을 갓생으로 바꾸세요! 화면 공유와 함께 각자의 개발·사이드프로젝트 목표를 완주합니다.'
        };
      }

      return {
        title: '하루 30분 AI 툴(ChatGPT·노션) 실무 활용 7일 챌린지',
        desc: '바쁜 일상 속 하루 30분 투자로 업무 생산성을 3배 높이는 실전 AI 챌린지 크루가 가장 잘 어울립니다!'
      };
    };

    // 결과 화면 표시 함수
    const showResult = () => {
      const recommendation = getRecommendation(quizState.answers);

      questionBoxEl.classList.add('hidden');
      resultBoxEl.classList.remove('hidden');
      stepTextEl.textContent = '진단 완료 (100%)';
      progressBarEl.style.width = '100%';

      resultTitleEl.textContent = recommendation.title;
      resultDescEl.textContent = recommendation.desc;
      applyBtnEl.dataset.crew = recommendation.title;
    };

    // 이벤트 위임으로 선택지 버튼 클릭 처리
    optionsListEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.quiz-option-btn');
      if (!btn) return;

      const selectedAnswer = btn.dataset.answer;
      quizState.answers.push(selectedAnswer);

      if (quizState.currentIndex < QUESTIONS.length - 1) {
        quizState.currentIndex += 1;
        renderQuestion();
      } else {
        showResult();
      }
    });

    // 다시 테스트하기 버튼
    retryBtnEl.addEventListener('click', () => {
      quizState.currentIndex = 0;
      quizState.answers = [];
      resultBoxEl.classList.add('hidden');
      questionBoxEl.classList.remove('hidden');
      renderQuestion();
    });

    // 초기 질문 렌더링
    renderQuestion();
  };

  /* ========================================================================
     4. 테마별 모임 카드 렌더링 & 탭 필터링
  ======================================================================== */
  const initCrewCardsAndTabs = () => {
    const crewGridEl = document.getElementById('crewGrid');
    const tabButtons = document.querySelectorAll('.tab-btn');

    const renderCards = (filterCategory = 'all') => {
      const filteredList =
        filterCategory === 'all'
          ? CREW_DATA
          : CREW_DATA.filter((item) => item.category === filterCategory);

      crewGridEl.innerHTML = filteredList
        .map(
          (crew) => `
          <article class="crew-card" data-category="${crew.category}">
            <div class="card-top">
              <div class="card-badges">
                <span class="badge ${crew.badgeClass}">${crew.category}</span>
                <span class="card-spots">🔥 잔여 ${crew.spotsLeft}석</span>
              </div>
              <h3 class="card-title">${crew.title}</h3>
              <p class="card-schedule">🗓️ ${crew.schedule}</p>
            </div>

            <div class="card-bottom">
              <div class="progress-wrap">
                <div class="progress-info">
                  <span>사전 신청률</span>
                  <strong>${crew.progress}%</strong>
                </div>
                <div class="progress-track">
                  <div class="progress-fill" style="width: ${crew.progress}%;"></div>
                </div>
              </div>

              <button 
                type="button" 
                class="btn btn-primary btn-full open-modal-btn" 
                data-crew="${crew.title}"
              >
                오픈 알림·사전 신청
              </button>
            </div>
          </article>
        `
        )
        .join('');
    };

    // 탭 버튼 클릭 이벤트 바인딩
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabButtons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const selectedFilter = btn.dataset.filter;
        renderCards(selectedFilter);
      });
    });

    // 초기 전체 카드 렌더링
    renderCards('all');
  };

  /* ========================================================================
     5. 보증금 환급 시뮬레이터 (실시간 계산기)
  ======================================================================== */
  const initCalculator = () => {
    const durationSlider = document.getElementById('durationSlider');
    const rateSlider = document.getElementById('rateSlider');
    const durationValueEl = document.getElementById('durationValue');
    const rateValueEl = document.getElementById('rateValue');
    const baseDepositTextEl = document.getElementById('baseDepositText');
    const refundAmountTextEl = document.getElementById('refundAmountText');
    const bonusAmountTextEl = document.getElementById('bonusAmountText');
    const totalPayoutTextEl = document.getElementById('totalPayoutText');
    const calcFeedbackMsgEl = document.getElementById('calcFeedbackMsg');

    const DEPOSIT_PER_WEEK = 10000; // 주당 기본 보증금 10,000원

    const formatKRW = (num) => `${num.toLocaleString('ko-KR')}원`;

    const updateCalculation = () => {
      const weeks = Number(durationSlider.value);
      const rate = Number(rateSlider.value);

      const baseDeposit = weeks * DEPOSIT_PER_WEEK;
      const refundAmount = Math.floor(baseDeposit * (rate / 100));
      // 100% 달성 시 기본 보증금의 10% 추가 리워드 보너스 지급
      const bonusAmount = rate === 100 ? Math.floor(baseDeposit * 0.1) : 0;
      const totalPayout = refundAmount + bonusAmount;

      durationValueEl.textContent = `${weeks}주 (기본 보증금 ${formatKRW(baseDeposit)})`;
      rateValueEl.textContent = `${rate}% 달성`;
      baseDepositTextEl.textContent = formatKRW(baseDeposit);
      refundAmountTextEl.textContent = formatKRW(refundAmount);
      bonusAmountTextEl.textContent = `+ ${formatKRW(bonusAmount)}`;
      totalPayoutTextEl.textContent = formatKRW(totalPayout);

      if (rate === 100) {
        calcFeedbackMsgEl.textContent =
          '🎉 100% 달성 시 보증금 전액 환급 + 10% 추가 상금 리워드가 지급됩니다!';
      } else {
        calcFeedbackMsgEl.textContent =
          '💪 조금만 더 힘내서 100%를 달성하면 보증금 전액과 추가 보너스까지 받을 수 있어요!';
      }
    };

    durationSlider.addEventListener('input', updateCalculation);
    rateSlider.addEventListener('input', updateCalculation);

    updateCalculation();
  };

  /* ========================================================================
     6. 아코디언 FAQ UI
  ======================================================================== */
  const initAccordionFAQ = () => {
    const items = document.querySelectorAll('.accordion-item');

    items.forEach((item) => {
      const trigger = item.querySelector('.accordion-trigger');
      const content = item.querySelector('.accordion-content');

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // 다른 열려있는 아코디언 닫기
        items.forEach((otherItem) => {
          otherItem.classList.remove('active');
          otherItem.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
          otherItem.querySelector('.accordion-content').style.maxHeight = null;
        });

        // 클릭한 항목 토글
        if (!isOpen) {
          item.classList.add('active');
          trigger.setAttribute('aria-expanded', 'true');
          content.style.maxHeight = `${content.scrollHeight}px`;
        }
      });
    });
  };

  /* ========================================================================
     7. 사전 신청 모달 팝업 & 수요 검증 폼 (Fake-door Test)
  ======================================================================== */
  const initModalAndForm = () => {
    const modalOverlay = document.getElementById('applyModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const confirmCloseBtn = document.getElementById('confirmCloseBtn');
    const modalFormView = document.getElementById('modalFormView');
    const modalSuccessView = document.getElementById('modalSuccessView');
    const preOrderForm = document.getElementById('preOrderForm');
    const crewSelect = document.getElementById('crewSelect');
    const confirmedCrewNameEl = document.getElementById('confirmedCrewName');

    const userNameInput = document.getElementById('userName');
    const userPhoneInput = document.getElementById('userPhone');
    const userEmailInput = document.getElementById('userEmail');
    const userExpectInput = document.getElementById('userExpectation');

    // 모달 열기 함수
    const openModal = (selectedCrewTitle = '자유 선택 (전체 테마)') => {
      // 폼 초기화 및 뷰 상태 리셋
      modalFormView.classList.remove('hidden');
      modalSuccessView.classList.add('hidden');

      // 전달받은 모임 제목이 select 옵션에 있으면 자동 선택
      const optionExists = Array.from(crewSelect.options).some(
        (opt) => opt.value === selectedCrewTitle
      );
      crewSelect.value = optionExists ? selectedCrewTitle : '자유 선택 (전체 테마)';

      // 그로스 해킹: 어떤 모임 버튼을 클릭했는지 localStorage에 카운트 누적
      trackCrewInterest(crewSelect.value);

      modalOverlay.classList.remove('hidden');
      document.body.style.overflow = 'hidden'; // 배경 스크롤 잠금
    };

    // 모달 닫기 함수
    const closeModal = () => {
      modalOverlay.classList.add('hidden');
      document.body.style.overflow = '';
    };

    // 동적으로 렌더링되는 카드 버튼까지 대응하기 위해 document 이벤트 위임 사용
    document.addEventListener('click', (e) => {
      const openBtn = e.target.closest('.open-modal-btn');
      if (openBtn) {
        const crewTitle = openBtn.dataset.crew || '자유 선택 (전체 테마)';
        openModal(crewTitle);
      }
    });

    closeModalBtn.addEventListener('click', closeModal);
    confirmCloseBtn.addEventListener('click', closeModal);

    // 모달 배경(Overlay) 클릭 시 닫기
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });

    // ESC 키 누르면 모달 닫기
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
        closeModal();
      }
    });

    // 연락처 입력 시 하이픈(010-XXXX-XXXX) 자동 포맷팅 도우미
    userPhoneInput.addEventListener('input', (e) => {
      const rawNumbers = e.target.value.replace(/[^0-9]/g, '');
      let formatted = rawNumbers;
      if (rawNumbers.length > 3 && rawNumbers.length <= 7) {
        formatted = `${rawNumbers.slice(0, 3)}-${rawNumbers.slice(3)}`;
      } else if (rawNumbers.length > 7) {
        formatted = `${rawNumbers.slice(0, 3)}-${rawNumbers.slice(3, 7)}-${rawNumbers.slice(7, 11)}`;
      }
      e.target.value = formatted;
    });

    // 개별 필드 에러 표시 토글 헬퍼
    const setFieldValidity = (inputEl, isValid) => {
      const group = inputEl.closest('.form-group');
      if (!isValid) {
        group.classList.add('invalid');
      } else {
        group.classList.remove('invalid');
      }
      return isValid;
    };

    // 폼 제출 및 유효성 검사
    preOrderForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nickname = userNameInput.value.trim();
      const phone = userPhoneInput.value.trim();
      const email = userEmailInput.value.trim();
      const expectation = userExpectInput.value.trim();
      const selectedCrew = crewSelect.value;

      // 정규식 검증 규칙
      const phoneRegex = /^010-\d{4}-\d{4}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      const isNameValid = setFieldValidity(userNameInput, nickname.length >= 2);
      const isPhoneValid = setFieldValidity(userPhoneInput, phoneRegex.test(phone));
      const isEmailValid = setFieldValidity(userEmailInput, emailRegex.test(email));
      const isExpectValid = setFieldValidity(userExpectInput, expectation.length >= 2);

      if (!isNameValid || !isPhoneValid || !isEmailValid || !isExpectValid) {
        return; // 하나라도 통과하지 못하면 제출 중단
      }

      // 제출 데이터 페이로드 구성
      const submissionData = {
        id: Date.now(),
        selectedCrew,
        nickname,
        phone,
        email,
        expectation,
        couponCode: 'CREWUP-EARLY50',
        submittedAt: new Date().toISOString()
      };

      // 1) localStorage에 사전 신청 내역 저장
      const SUBMISSIONS_KEY = 'crewup_preorder_submissions';
      const savedList = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || '[]');
      savedList.push(submissionData);
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(savedList));

      /* ----------------------------------------------------------------------
         [실전 확장용] Google Sheets 웹훅(Apps Script) 또는 Formspree 연동 예시 코드
         나중에 엔드포인트 URL만 넣으시면 서버로 즉시 데이터가 수집됩니다.
      ----------------------------------------------------------------------- */
      /*
      try {
        const WEBHOOK_URL = 'https://formspree.io/f/YOUR_FORM_ID'; // 또는 구글 앱스 스크립트 웹앱 URL
        await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(submissionData)
        });
      } catch (error) {
        console.error('외부 웹훅 전송 중 오류 발생:', error);
      }
      */

      // 2) 완료 화면으로 전환 및 폼 리셋
      confirmedCrewNameEl.textContent = `[${selectedCrew}]`;
      preOrderForm.reset();
      modalFormView.classList.add('hidden');
      modalSuccessView.classList.remove('hidden');
    });
  };

  /* ========================================================================
     전체 모듈 초기화 실행
  ======================================================================== */
  initMobileMenu();
  initCountdown();
  initQuiz();
  initCrewCardsAndTabs();
  initCalculator();
  initAccordionFAQ();
  initModalAndForm();
});

/* ========================================================================
     8. [보너스] 숨겨진 관리자(Admin) 수요 확인 팝업 (푸터 카피라이트 더블클릭 시 실행)
     - js/app.js 맨 아래 initModalAndForm(); 바로 밑에 붙여넣으세요!
  ======================================================================== */
  const copyrightEl = document.querySelector('.copyright');
  if (copyrightEl) {
    copyrightEl.style.cursor = 'pointer';
    copyrightEl.title = '더블클릭하면 사전 신청자 명단(Admin)을 확인합니다';

    copyrightEl.addEventListener('dblclick', () => {
      const clicks = JSON.parse(localStorage.getItem('crewup_click_counts') || '{}');
      const list = JSON.parse(localStorage.getItem('crewup_preorder_submissions') || '[]');

      console.table(clicks);
      console.table(list);

      alert(
        `📊 [실시간 수요 검증 현황]\n\n` +
        `1. 테마별 클릭 수:\n${JSON.stringify(clicks, null, 2)}\n\n` +
        `2. 총 사전 신청 완료: ${list.length}명\n` +
        `(상세 표는 F12 > Console 창에 출력되었습니다!)`
      );
    });
  }