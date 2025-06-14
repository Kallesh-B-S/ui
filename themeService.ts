// themeService.ts
import { StyleManager } from './styleManager';

export const ThemeService = {
  setTheme(themeToSet: string) {
    StyleManager.setStyle('theme', `themes/${themeToSet}.css`);
  }
};
