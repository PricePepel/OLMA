import { cookies } from 'next/headers'

export type Locale = 'en' | 'ru'

const defaultLocale: Locale = 'en'

export const locales: Locale[] = ['en', 'ru']

export async function getLocale(): Promise<Locale> {
  try {
    const cookieStore = await cookies()
    const locale = cookieStore.get('locale')?.value as Locale
    return locales.includes(locale) ? locale : defaultLocale
  } catch {
    return defaultLocale
  }
}

export function setLocale(locale: Locale) {
  if (typeof window !== 'undefined') {
    document.cookie = `locale=${locale}; path=/; max-age=31536000`
  }
}

// Translation dictionaries
export const translations = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      view: 'View',
      close: 'Close',
      submit: 'Submit',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
    },
    auth: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signOut: 'Sign Out',
      email: 'Email',
      password: 'Password',
      fullName: 'Full Name',
      username: 'Username',
      forgotPassword: 'Forgot Password?',
      rememberMe: 'Remember me',
      or: 'or',
      continueWithGoogle: 'Continue with Google',
      continueWithGitHub: 'Continue with GitHub',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
    },
    navigation: {
      home: 'Home',
      feed: 'Feed',
      skills: 'Skills',
      offers: 'Offers',
      clubs: 'Clubs',
      messages: 'Messages',
      shop: 'Shop',
      leaderboard: 'Leaderboard',
      settings: 'Settings',
      profile: 'Profile',
    },
    skills: {
      title: 'Skills',
      description: 'Browse and search for skills in your community',
      addSkill: 'Add Skill',
      skillName: 'Skill Name',
      skillDescription: 'Skill Description',
      skillCategory: 'Category',
      difficultyLevel: 'Difficulty Level',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    },
    offers: {
      title: 'Skill Offers',
      description: 'Find people to teach or learn skills from',
      createOffer: 'Create Offer',
      teach: 'Teach',
      learn: 'Learn',
      price: 'Price',
      availability: 'Availability',
      geoOptIn: 'Enable location-based matching',
    },
    clubs: {
      title: 'Clubs',
      description: 'Join clubs and connect with like-minded people',
      createClub: 'Create Club',
      clubName: 'Club Name',
      clubDescription: 'Club Description',
      isPrivate: 'Private Club',
      members: 'Members',
      events: 'Events',
      owner: 'Owner',
      moderator: 'Moderator',
      member: 'Member',
    },
    messages: {
      title: 'Messages',
      description: 'Chat with other community members',
      newMessage: 'New Message',
      typeMessage: 'Type a message...',
      send: 'Send',
      unread: 'Unread',
    },
    shop: {
      title: 'Shop',
      description: 'Spend your earned currency on cosmetics and features',
      personalCurrency: 'Personal Currency',
      clubCurrency: 'Club Currency',
      buy: 'Buy',
      insufficientFunds: 'Insufficient funds',
    },
    leaderboard: {
      title: 'Leaderboard',
      description: 'See top performers and achievements in your community',
      topUsers: 'Top Users',
      topClubs: 'Top Clubs',
      experience: 'Experience',
      level: 'Level',
      achievements: 'Achievements',
    },
    settings: {
      title: 'Settings',
      description: 'Manage your account preferences and privacy',
      account: 'Account',
      privacy: 'Privacy',
      notifications: 'Notifications',
      language: 'Language',
      theme: 'Theme',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      system: 'System',
    },
  },
  ru: {
    common: {
      loading: 'Загрузка...',
      error: 'Произошла ошибка',
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      create: 'Создать',
      search: 'Поиск',
      filter: 'Фильтр',
      sort: 'Сортировка',
      view: 'Просмотр',
      close: 'Закрыть',
      submit: 'Отправить',
      back: 'Назад',
      next: 'Далее',
      previous: 'Предыдущий',
    },
    auth: {
      signIn: 'Войти',
      signUp: 'Зарегистрироваться',
      signOut: 'Выйти',
      email: 'Email',
      password: 'Пароль',
      fullName: 'Полное имя',
      username: 'Имя пользователя',
      forgotPassword: 'Забыли пароль?',
      rememberMe: 'Запомнить меня',
      or: 'или',
      continueWithGoogle: 'Продолжить с Google',
      continueWithGitHub: 'Продолжить с GitHub',
      alreadyHaveAccount: 'Уже есть аккаунт?',
      dontHaveAccount: 'Нет аккаунта?',
    },
    navigation: {
      home: 'Главная',
      feed: 'Лента',
      skills: 'Навыки',
      offers: 'Предложения',
      clubs: 'Клубы',
      messages: 'Сообщения',
      shop: 'Магазин',
      leaderboard: 'Рейтинг',
      settings: 'Настройки',
      profile: 'Профиль',
    },
    skills: {
      title: 'Навыки',
      description: 'Просматривайте и ищите навыки в вашем сообществе',
      addSkill: 'Добавить навык',
      skillName: 'Название навыка',
      skillDescription: 'Описание навыка',
      skillCategory: 'Категория',
      difficultyLevel: 'Уровень сложности',
      beginner: 'Начинающий',
      intermediate: 'Средний',
      advanced: 'Продвинутый',
    },
    offers: {
      title: 'Предложения навыков',
      description: 'Найдите людей для обучения или изучения навыков',
      createOffer: 'Создать предложение',
      teach: 'Обучать',
      learn: 'Изучать',
      price: 'Цена',
      availability: 'Доступность',
      geoOptIn: 'Включить поиск по местоположению',
    },
    clubs: {
      title: 'Клубы',
      description: 'Присоединяйтесь к клубам и общайтесь с единомышленниками',
      createClub: 'Создать клуб',
      clubName: 'Название клуба',
      clubDescription: 'Описание клуба',
      isPrivate: 'Приватный клуб',
      members: 'Участники',
      events: 'События',
      owner: 'Владелец',
      moderator: 'Модератор',
      member: 'Участник',
    },
    messages: {
      title: 'Сообщения',
      description: 'Общайтесь с другими участниками сообщества',
      newMessage: 'Новое сообщение',
      typeMessage: 'Введите сообщение...',
      send: 'Отправить',
      unread: 'Непрочитанные',
    },
    shop: {
      title: 'Магазин',
      description: 'Тратьте заработанную валюту на косметику и функции',
      personalCurrency: 'Личная валюта',
      clubCurrency: 'Клубная валюта',
      buy: 'Купить',
      insufficientFunds: 'Недостаточно средств',
    },
    leaderboard: {
      title: 'Рейтинг',
      description: 'Смотрите лучших участников и достижения в вашем сообществе',
      topUsers: 'Лучшие пользователи',
      topClubs: 'Лучшие клубы',
      experience: 'Опыт',
      level: 'Уровень',
      achievements: 'Достижения',
    },
    settings: {
      title: 'Настройки',
      description: 'Управляйте настройками аккаунта и конфиденциальностью',
      account: 'Аккаунт',
      privacy: 'Конфиденциальность',
      notifications: 'Уведомления',
      language: 'Язык',
      theme: 'Тема',
      darkMode: 'Темная тема',
      lightMode: 'Светлая тема',
      system: 'Системная',
    },
  },
} as const

export function t(locale: Locale, key: string): string {
  const keys = key.split('.')
  let value: any = translations[locale]
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      // Fallback to English if translation not found
      value = translations.en
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey]
        } else {
          return key // Return key if translation not found
        }
      }
    }
  }
  
  return typeof value === 'string' ? value : key
}
