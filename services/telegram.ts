// Mocking the window type for TS
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initData: string;
        initDataUnsafe: any;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
          showProgress: (leaveActive: boolean) => void;
          hideProgress: () => void;
        };
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        openInvoice: (url: string, callback?: (status: string) => void) => void;
        themeParams: any;
      };
    };
  }
}

// Robust fallback mock for development in browser
const mockTg = {
  initData: '',
  initDataUnsafe: {},
  ready: () => console.log('[TG Mock] ready'),
  expand: () => console.log('[TG Mock] expand'),
  close: () => console.log('[TG Mock] close'),
  MainButton: {
    text: '',
    color: '',
    textColor: '',
    isVisible: false,
    show: () => {},
    hide: () => {},
    onClick: () => {},
    offClick: () => {},
    showProgress: () => {},
    hideProgress: () => {},
  },
  BackButton: {
    isVisible: false,
    show: () => {},
    hide: () => {},
    onClick: () => {},
    offClick: () => {},
  },
  HapticFeedback: {
    impactOccurred: () => console.log('[TG Mock] Haptic impact'),
    notificationOccurred: () => console.log('[TG Mock] Haptic notification'),
    selectionChanged: () => console.log('[TG Mock] Haptic selection'),
  },
  openInvoice: (url: string, callback?: (status: string) => void) => {
     console.log('[TG Mock] openInvoice:', url);
     // Simulate successful payment in dev
     if (callback) setTimeout(() => callback('paid'), 2000);
  },
  themeParams: {},
};

export const tg = window.Telegram?.WebApp || mockTg as any;

export const initTelegram = () => {
  if (window.Telegram?.WebApp) {
      tg.ready();
      tg.expand();
  }
};

export const haptic = {
  impact: (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    tg.HapticFeedback?.impactOccurred(style);
  },
  success: () => {
    tg.HapticFeedback?.notificationOccurred('success');
  },
  error: () => {
    tg.HapticFeedback?.notificationOccurred('error');
  },
  selection: () => {
    tg.HapticFeedback?.selectionChanged();
  }
};

export const getUserData = () => {
  return tg.initDataUnsafe?.user;
};
