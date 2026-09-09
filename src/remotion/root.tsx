import { Composition } from "remotion";
import { TicTacToeReveal } from "@/components/tictactoe-reveal";

export const RemotionRoot = () => (
  <>
    <Composition
      id="TicTacToeReveal"
      component={TicTacToeReveal}
      durationInFrames={1200}
      fps={30}
      width={1080}
      height={1350}
      defaultProps={{
        captainMove: 1,
        startingBoard: ["X", "-", "O", "-", "-", "-", "-", "-", "-"],
        format: "portrait",
      }}
    />
    <Composition
      id="TicTacToeRevealSquare"
      component={TicTacToeReveal}
      durationInFrames={1200}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={{
        captainMove: 1,
        startingBoard: ["X", "-", "O", "-", "-", "-", "-", "-", "-"],
        format: "square",
      }}
    />
    <Composition
      id="TicTacToeRevealVertical"
      component={TicTacToeReveal}
      durationInFrames={1200}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        captainMove: 1,
        startingBoard: ["X", "-", "O", "-", "-", "-", "-", "-", "-"],
        format: "vertical",
      }}
    />
  </>
);
