import { FC, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import clsx from "clsx";
import { HiMoon, HiSun } from "react-icons/hi2";
import { Button } from "@heroui/react";

export interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className }) => {
  const [isMounted, setIsMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  const isLight = resolvedTheme === "light";

  const handleToggle = () => {
    setTheme(isLight ? "dark" : "light");
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div aria-hidden className="w-6 h-6" />;

  return (
    <Button
      aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
      variant="outline"
      onPress={handleToggle}
    >
      {isLight ? <HiSun /> : <HiMoon />}
    </Button>
  );
};
