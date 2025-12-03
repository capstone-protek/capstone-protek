import { createContext, useContext } from "react";
import type { Dispatch, SetStateAction } from "react";

export type ThemeContextType = {
  dark: boolean;
  setDark: Dispatch<SetStateAction<boolean>>;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}