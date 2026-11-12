import { Moon, Sun } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  return (
    <IconButton aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} onClick={toggleTheme}>
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </IconButton>
  );
}
