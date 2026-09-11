export { cn } from "cn";

export const shuffle = <T>(items: T[]) => {
  const shuffled: T[] = [];
  for (let index = items.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [items[randomIndex], items[index]];
  }
  return shuffled;
};

export const yieldToBrowser = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
