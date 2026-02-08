const tg = (window as any).Telegram?.WebApp;

export const TelegramService = {
  ready: () => tg?.ready(),
  expand: () => tg?.expand(),
  close: () => tg?.close(),
  initData: tg?.initData || '',
  platform: tg?.platform || 'unknown',
  user: tg?.initDataUnsafe?.user,
  
  haptic: {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => 
      tg?.HapticFeedback.impactOccurred(style),
    notification: (type: 'error' | 'success' | 'warning') => 
      tg?.HapticFeedback.notificationOccurred(type),
    selection: () => tg?.HapticFeedback.selectionChanged(),
  },

  openInvoice: (url: string, callback?: (status: string) => void) => {
    // DEV BYPASS: If it's a test URL (from mock API), don't call actual Telegram API
    // This prevents "[Telegram.WebApp] Invoice url is invalid" errors during development
    if (url.includes('test_invoice')) {
        console.log('[Mock] Simulating invoice payment for:', url);
        if (callback) {
          // Add a small delay to simulate network/UI interaction
          setTimeout(() => callback('paid'), 1500);
        }
        return;
    }

    if (tg?.openInvoice) {
      tg.openInvoice(url, (status: string) => {
        if (callback) callback(status);
      });
    } else {
      console.warn('Telegram openInvoice not available');
      // Fallback for testing outside TG
      if (callback) callback('paid');
    }
  },

  showConfirm: (message: string, callback: (ok: boolean) => void) => {
    if (tg?.showConfirm) {
      tg.showConfirm(message, callback);
    } else {
      callback(window.confirm(message));
    }
  },

  setMainButton: (params: { text: string; isVisible: boolean; onClick: () => void }) => {
    if (!tg?.MainButton) return;
    tg.MainButton.text = params.text;
    tg.MainButton.isVisible = params.isVisible;
    // Note: Proper cleanup requires storing the callback reference. 
    // Simplified here to avoid SDK errors.
    if (params.isVisible) {
      tg.MainButton.onClick(params.onClick);
    }
  }
};