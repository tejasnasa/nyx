import ThemeToggle from "@/components/theme-toggle";
import Image from "next/image";

export default function Home() {
  return (
    <main className="dark:bg-black h-dvh w-dvw">
      <ThemeToggle />
    </main>
  );
}
