import { Board } from "@/components/board";
import { preloadClickSound } from "@/lib/sound";
import { useEffect } from "react";

export function App() {
  useEffect(() => {
    preloadClickSound();
  }, []);

  return <Board />;
}
