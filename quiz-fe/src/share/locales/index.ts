export const languages = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'English' },
];

export const defaultLang = 'vi';

export const translations = {
  vi: {
    // HeaderClient
    vocabulary: 'Từ vựng',
    battle: 'Thách đấu',
    leaderboard: 'Bảng xếp hạng',
    review: 'Ôn tập',
    admin: 'Quản trị',
    program: 'Chương trình',
    programPractice: 'Chương trình ôn luyện',
    loadingPrograms: 'Đang tải chương trình...',
    login: 'Đăng nhập',
    register: 'Đăng ký',
    loading: 'Đang tải...',
    // HeroClient
    heroTitle: 'Daily English Quiz',
    heroSubtitle: 'Xây dựng kỹ năng. Chiến thắng mỗi ngày.',
    heroDesc: 'Luyện tập các bài quiz ngắn, theo dõi tiến trình và cạnh tranh trên bảng xếp hạng. Luyện tập đều đặn hiệu quả hơn học dồn.',
    playNow: 'Chơi ngay',
    leaderboardBtn: 'Bảng xếp hạng',
    // User / Account
    account: 'Tài khoản',
    quizHistory: 'Lịch sử làm bài',
    settings: 'Cài đặt',
    logout: 'Đăng xuất',
    language: 'Ngôn ngữ',
    english: 'English',
    vietnamese: 'Tiếng Việt',
  },
  en: {
    vocabulary: 'Vocabulary',
    battle: 'Battle',
    leaderboard: 'Leaderboard',
    review: 'Review',
    admin: 'Admin',
    program: 'Program',
    programPractice: 'Practice Programs',
    loadingPrograms: 'Loading programs...',
    login: 'Login',
    register: 'Register',
    loading: 'Loading...',
    heroTitle: 'Daily English Quiz',
    heroSubtitle: 'Build Skills. Win Daily.',
    heroDesc: 'Practice bite-sized quizzes, track progress, and compete on the leaderboard. Short, consistent practice beats occasional cramming.',
    playNow: 'Play Now',
    leaderboardBtn: 'Leaderboard',
    // User / Account
    account: 'Account',
    quizHistory: 'Quiz History',
    settings: 'Settings',
    logout: 'Logout',
    language: 'Language',
    english: 'English',
    vietnamese: 'Tiếng Việt',
  },
};

export function t(lang: string, key: string): string {
  const tr: any = translations as any;
  return tr[lang]?.[key] || tr[defaultLang][key] || key;
}
