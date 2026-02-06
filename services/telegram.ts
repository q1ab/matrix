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

export const tg = window.Telegram.WebApp;

export const initTelegram = () => {
  tg.ready();
  tg.expand();
  // Set header color if needed
  // tg.setHeaderColor('#1a0b2e'); 
};

export const haptic = {
  impact: (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    tg.HapticFeedback.impactOccurred(style);
  },
  success: () => {
    tg.HapticFeedback.notificationOccurred('success');
  },
  error: () => {
    tg.HapticFeedback.notificationOccurred('error');
  },
  selection: () => {
    tg.HapticFeedback.selectionChanged();
  }
};

export const getUserData = () => {
  return tg.initDataUnsafe?.user;
};