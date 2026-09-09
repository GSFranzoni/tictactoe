import { useMemo } from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  createVisualMinimaxTrace,
  outcomeLabel,
  scoreText,
  type VisibleCandidate,
  type VisualMinimaxTrace,
} from "@/lib/minimax-visual-trace";
import { checkWinner, makeMoveOnBoard, type Board } from "@/lib/game";
import { Link, Tag, type TagTone, ToyBoard } from "@/remotion/visuals";

export type RevealProps = {
  startingBoard?: Board;
  captainMove?: number;
  format?: "portrait" | "square" | "vertical";
};

const ease = Easing.bezier(0.33, 0, 0.16, 1);
const motion = (frame: number, frames: number[], values: number[]) =>
  interpolate(frame, frames, values, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });

const scoreTone = (score: number): TagTone => (score > 0 ? "teal" : score < 0 ? "coral" : "ink");

const SFX = {
  click: staticFile("sfx/typewriter-soft-click.wav"),
  pop: staticFile("sfx/light-pop-whoosh.wav"),
  coin: staticFile("sfx/arcade-coin.wav"),
  tick: staticFile("sfx/soft-tick.wav"),
  reveal: staticFile("sfx/tile-reveal.wav"),
  landing: staticFile("sfx/toy-drop.wav"),
};

const validate = (board: Board, move: number) => {
  const xCount = board.filter((cell) => cell === "X").length;
  const oCount = board.filter((cell) => cell === "O").length;
  if (
    board.length !== 9 ||
    board.some((cell) => !["X", "O", "-"].includes(cell)) ||
    xCount !== oCount ||
    checkWinner(board) ||
    !Number.isInteger(move) ||
    board[move] !== "-"
  ) {
    throw new Error(
      "Choose a nonterminal board with equal X/O counts and an empty Player X square (0–8).",
    );
  }
};

export function TicTacToeReveal({
  startingBoard = ["X", "-", "O", "-", "-", "-", "-", "-", "-"],
  captainMove = 1,
  format = "portrait",
}: RevealProps) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  // The square cut is a camera crop of the same tabletop world, rather than a
  // reduced portrait frame. That keeps the artwork edge-to-edge in 1:1.
  const stageScale = 1;
  const stageLeft = (width - 1080 * stageScale) / 2;
  const stageTop = format === "square" ? -105 : format === "vertical" ? (height - 1350) / 2 : 0;
  const film = useMemo(() => {
    validate(startingBoard, captainMove);
    const rootBoard = makeMoveOnBoard(startingBoard, captainMove, "X");
    if (checkWinner(rootBoard)) {
      throw new Error("The featured X move must leave a turn for Player O.");
    }

    const trace = createVisualMinimaxTrace(rootBoard, "O");
    return {
      rootBoard,
      trace,
      finalBoard: makeMoveOnBoard(rootBoard, trace.bestMove, "O"),
    };
  }, [startingBoard, captainMove]);

  const { rootBoard, trace, finalBoard } = film;
  const finalMoveAt = 1035;
  const rootSize = motion(frame, [145, 205, 990, 1040], [510, 304, 304, 510]);
  const candidateStarts = [220, 365, 510];
  const candidatePositions = [-420, 0, 420];

  const cameraX = motion(
    frame,
    [0, 165, 224, 258, 342, 369, 403, 487, 514, 548, 632, 672, 745, 850, 885, 930, 940, 1018, 1040],
    [0, 0, 0, -420, -420, -420, 0, 0, 0, 420, 420, 0, 0, 0, 492, 492, 492, 0, 0],
  );
  const cameraY = motion(
    frame,
    [0, 120, 150, 190, 224, 258, 632, 672, 745, 850, 885, 930, 940, 1018, 1040],
    [-195, -195, -150, 0, 0, 470, 470, 125, 125, 125, 410, 410, 410, -195, -195],
  );
  const cameraScale = motion(
    frame,
    [0, 150, 220, 242, 632, 672, 745, 850, 885, 930, 940, 1018, 1040],
    [1, 1.08, 1.04, 1, 1, 0.66, 0.66, 0.66, 1.08, 1.08, 1.08, 1, 1],
  );
  const shellOpacity = motion(frame, [115, 160, 1015, 1050], [1, 0, 0, 1]);
  const rootOpacity = 1;
  const selectedCandidateIndex = trace.candidates.findIndex((candidate) => candidate.selected);
  const explored = Math.min(
    trace.exploredStates,
    Math.floor(
      motion(
        frame,
        [220, 330, 450, 570, 680],
        [
          1,
          trace.exploredStates * 0.06,
          trace.exploredStates * 0.28,
          trace.exploredStates * 0.71,
          trace.exploredStates,
        ],
      ),
    ),
  );

  return (
    <>
      <AbsoluteFill className="overflow-hidden bg-canvas" from={-301}>
        <AbsoluteFill
          className="absolute left-0 top-0 h-[1350px] w-[1080px] overflow-hidden bg-canvas font-sans text-ink"
          style={{
            left: stageLeft,
            top: stageTop,
            scale: stageScale,
            transformOrigin: "top left",
          }}
          from={-104}
        >
          <GameShell frame={frame} opacity={shellOpacity} final={frame >= 1050} format={format} />

          <div
            className="absolute"
            style={{
              left: 540,
              top: 480,
              opacity: rootOpacity,
              scale: cameraScale,
              translate: `${-cameraX}px ${-cameraY}px`,
              transformOrigin: "center center",
            }}
          >
            <div
              className="absolute z-[4]"
              style={{
                left: -rootSize / 2,
                top: -rootSize / 2,
              }}
            >
              <ToyBoard
                board={frame < 72 ? startingBoard : frame >= finalMoveAt ? finalBoard : rootBoard}
                size={rootSize}
                frame={frame}
                markAt={frame >= finalMoveAt ? finalMoveAt : 72}
                markIndex={frame >= finalMoveAt ? trace.bestMove : captainMove}
                pressIndex={frame < 82 ? captainMove : frame >= finalMoveAt ? trace.bestMove : null}
                pressAt={frame >= finalMoveAt ? finalMoveAt : 64}
              />
              <div
                className="absolute left-0 text-center"
                style={{
                  top: rootSize + 28,
                  width: rootSize,
                  opacity: motion(frame, [190, 225, 930, 965], [0, 1, 1, 0]),
                }}
              >
                <Tag>PLAYER O · MAX</Tag>
              </div>
            </div>

            {trace.candidates.map((candidate, index) => (
              <CandidateBranch
                key={candidate.node.move}
                candidate={candidate}
                index={index}
                x={candidatePositions[index]}
                start={candidateStarts[index]}
                rootSize={rootSize}
                frame={frame}
              />
            ))}
            <SelectedMoveTransfer
              frame={frame}
              bestMove={trace.bestMove}
              sourceX={candidatePositions[selectedCandidateIndex]}
              rootSize={rootSize}
            />
          </div>

          <div
            className="absolute bottom-[74px] left-[64px] font-mono text-[15px] tracking-[.08em] text-muted"
            style={{
              opacity: motion(frame, [235, 260, 835, 875], [0, 0.82, 0.82, 0]),
            }}
          >
            STATES EXPLORED&nbsp;&nbsp;
            <b className="text-[22px] text-ink">{explored.toLocaleString("en-US")}</b>
          </div>

          {frame < 112 && <Cursor frame={frame} move={captainMove} />}

          <div
            className="absolute right-[60px] bottom-[55px] font-mono text-[18px] text-muted"
            style={{
              opacity: motion(frame, [1040, 1080], [0, 0.8]),
            }}
          >
            @gsfranzoni
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      <SoundDesign trace={trace} />
    </>
  );
}

function SoundDesign({ trace }: { trace: VisualMinimaxTrace }) {
  const candidateStarts = [220, 365, 510];
  const scoreLiftStarts = candidateStarts.map((start) => start + 100);
  const maxTransferStarts = [700, 728, 756];
  const childStarts = trace.candidates.flatMap((candidate, index) =>
    candidate.responses.map((_, responseIndex) => candidateStarts[index] + 32 + responseIndex * 20),
  );
  const minLandingStarts = trace.candidates.flatMap((candidate, index) =>
    candidate.responses.map(
      (_, responseIndex) => candidateStarts[index] + 100 + 28 + responseIndex * 5,
    ),
  );
  const maxLandingStarts = maxTransferStarts.map((start) => start + 42);

  return (
    <>
      <Cue at={72} src={SFX.click} volume={0.2} />
      {candidateStarts.map((from) => (
        <Cue key={`candidate-${from}`} at={from + 12} src={SFX.pop} volume={0.105} />
      ))}
      {childStarts.map((from) => (
        <Cue key={`child-${from}`} at={from + 11} src={SFX.tick} volume={0.5} />
      ))}
      {scoreLiftStarts.map((from) => (
        <Cue key={`min-score-${from}`} src={SFX.coin} at={from} volume={0.5} />
      ))}
      {maxTransferStarts.map((from, index) => (
        <Cue
          key={`max-score-${from}`}
          src={SFX.coin}
          at={from}
          volume={0.55}
          toneFrequency={1 + index * 0.08}
        />
      ))}
      {minLandingStarts.map((from) => (
        <Cue key={`min-land-${from}`} at={from} src={SFX.tick} volume={0.25} />
      ))}
      {maxLandingStarts.map((from, index) => (
        <Cue
          key={`max-land-${from}`}
          at={from}
          src={SFX.tick}
          volume={0.3}
          toneFrequency={1 + index * 0.08}
        />
      ))}
      <Cue at={912} src={SFX.reveal} volume={0.12} playbackRate={1} trimAfter={48} />
      <Cue at={1035} src={SFX.landing} volume={0.18} />
    </>
  );
}

function Cue({
  at,
  src,
  volume,
  toneFrequency,
  playbackRate,
  trimAfter,
}: {
  at: number;
  src: string;
  volume: number;
  toneFrequency?: number;
  playbackRate?: number;
  trimAfter?: number;
}) {
  return (
    <Sequence from={at} layout="none">
      <Audio
        src={src}
        volume={volume}
        toneFrequency={toneFrequency}
        playbackRate={playbackRate}
        trimAfter={trimAfter}
      />
    </Sequence>
  );
}

function GameShell({
  frame,
  opacity,
  final,
  format,
}: {
  frame: number;
  opacity: number;
  final: boolean;
  format: RevealProps["format"];
}) {
  const titleTop = format === "square" ? 250 : 135;
  const statusTop = format === "square" ? 990 : 1085;
  return (
    <div className="absolute inset-0" style={{ opacity }}>
      <div
        className="absolute w-full text-center text-[96px] font-bold tracking-[-.065em]"
        style={{
          top: titleTop,
        }}
      >
        Tic <span className="text-yellow">·</span> Tac <span className="text-yellow">·</span> Toe
      </div>
      <div
        className="absolute w-full text-center"
        style={{
          top: statusTop,
        }}
      >
        <Tag>
          {final
            ? "PLAYER O MADE A MOVE"
            : frame < 96
              ? "PLAYER X IS ON THE MOVE"
              : "PLAYER O IS THINKING…"}
        </Tag>
      </div>
    </div>
  );
}

function CandidateBranch({
  candidate,
  index,
  x,
  start,
  rootSize,
  frame,
}: {
  candidate: VisibleCandidate;
  index: number;
  x: number;
  start: number;
  rootSize: number;
  frame: number;
}) {
  const y = 410;
  const responseY = 680;
  const terminalY = 875;
  const minStart = start + 100;
  const maxStart = 700 + index * 28;
  const candidateValueVisible = motion(frame, [minStart + 34, minStart + 46], [0, 1]);
  const selectedAtRoot = candidate.selected ? motion(frame, [882, 912], [0, 1]) : 0;
  const rejected = candidate.selected
    ? 1
    : motion(frame, [850 + index * 16, 910 + index * 16], [1, 0]);
  const active = motion(frame, [start, start + 18], [0, 1]);
  const exit = motion(frame, [980, 1025], [1, 0]);
  const responseStarts = candidate.responses.map(
    (_, responseIndex) => start + 32 + responseIndex * 20,
  );

  return (
    <div style={{ opacity: active * rejected * exit }}>
      <Link
        from={[0, rootSize / 2]}
        to={[x, y - 108]}
        frame={frame}
        at={start - 18}
        selected={selectedAtRoot}
      />

      <div
        className="absolute z-[2]"
        style={{
          left: x - 108,
          top: y - 108,
        }}
      >
        <ToyBoard
          board={candidate.node.board}
          size={216}
          frame={frame}
          at={start}
          markAt={start + 12}
          markIndex={candidate.node.move}
          focusAt={start + 8}
          focusIndex={candidate.node.move}
        />
        <div
          className="absolute top-[237px] w-[216px] text-center"
          style={{
            opacity: motion(frame, [minStart - 10, minStart + 5, 800, 830], [0, 1, 1, 0]),
          }}
        >
          <Tag>PLAYER X · MIN</Tag>
        </div>
        <div
          className="absolute top-[-52px] w-[216px] text-center"
          style={{
            opacity: candidateValueVisible,
          }}
        >
          <ScoreBadge score={candidate.node.score} />
        </div>
      </div>

      {candidate.responses.map((response, responseIndex) => {
        const responseX = x + (responseIndex === 0 ? -105 : 105);
        const responseStart = responseStarts[responseIndex];
        const terminalStart = responseStart + 28;
        const terminalVisible = motion(frame, [terminalStart, terminalStart + 12], [0, 1]);
        const responseRejected = response.decisive
          ? 1
          : motion(frame, [minStart + 10, minStart + 38], [1, 0.2]);
        const selectedPath =
          candidate.selected && response.decisive ? motion(frame, [900, 925], [0, 1]) : 0;

        return (
          <div key={response.node.move} style={{ opacity: responseRejected }}>
            <Link
              from={[x, y + 108]}
              to={[responseX, responseY - 70]}
              frame={frame}
              at={responseStart - 14}
              dashed
              selected={selectedPath}
            />
            <div
              className="absolute"
              style={{
                left: responseX - 70,
                top: responseY - 70,
              }}
            >
              <ToyBoard
                board={response.node.board}
                size={140}
                frame={frame}
                at={responseStart}
                markAt={responseStart + 11}
                markIndex={response.node.move}
                focusAt={responseStart + 7}
                focusIndex={response.node.move}
              />
            </div>
            <Link
              from={[responseX, responseY + 72]}
              to={[responseX, terminalY - 58]}
              frame={frame}
              at={terminalStart - 11}
              dashed
              selected={selectedPath}
            />
            <div
              className="absolute"
              style={{
                left: responseX - 55,
                top: terminalY - 55,
                opacity: terminalVisible,
              }}
            >
              <ToyBoard
                board={response.terminal.board}
                size={110}
                frame={frame}
                at={terminalStart}
                markAt={terminalStart + 7}
                markIndex={response.terminal.move}
                focusAt={terminalStart + 5}
                focusIndex={response.terminal.move}
              />
              <div className="absolute left-[-55px] top-[126px] w-[220px] text-center">
                <OutcomeTag terminal={response.terminal} />
              </div>
            </div>
            <ValueToken
              frame={frame}
              start={minStart + responseIndex * 5}
              end={minStart + 28 + responseIndex * 5}
              from={[responseX, terminalY + 85]}
              to={[x, y + 115]}
              score={response.node.score}
              visible={terminalVisible}
            />
          </div>
        );
      })}

      <ValueToken
        frame={frame}
        start={maxStart}
        end={maxStart + 42}
        from={[x, y - 120]}
        to={[0, 145]}
        score={candidate.node.score}
        visible={candidateValueVisible}
      />

      {candidate.selected && (
        <div
          className="absolute w-[200px] text-center"
          style={{
            left: x - 100,
            top: y + 145,
            opacity: motion(frame, [912, 930, 965, 980], [0, 1, 1, 0]),
          }}
        >
          <Tag tone="teal">BEST MOVE</Tag>
        </div>
      )}
    </div>
  );
}

function cellCenter(index: number, size: number): [number, number] {
  const gap = size * 0.023;
  const cell = (size - gap * 2) / 3;
  return [(index % 3) * (cell + gap) + cell / 2, Math.floor(index / 3) * (cell + gap) + cell / 2];
}

function SelectedMoveTransfer({
  frame,
  bestMove,
  sourceX,
  rootSize,
}: {
  frame: number;
  bestMove: number;
  sourceX: number;
  rootSize: number;
}) {
  const t = motion(frame, [940, 1018], [0, 1]);
  const sourceCell = cellCenter(bestMove, 216);
  const targetCell = cellCenter(bestMove, rootSize);
  const from: [number, number] = [sourceX - 108 + sourceCell[0], 410 - 108 + sourceCell[1]];
  const to: [number, number] = [-rootSize / 2 + targetCell[0], -rootSize / 2 + targetCell[1]];
  const x = from[0] + (to[0] - from[0]) * t;
  const y = from[1] + (to[1] - from[1]) * t;

  return (
    <div
      className="absolute z-[10] grid h-[62px] w-[62px] place-items-center rounded-[18px] border-[3px] border-ink bg-teal-soft shadow-[5px_6px_0_var(--ds-ink)]"
      style={{
        left: x - 31,
        top: y - 31,
        opacity: motion(frame, [930, 940, 1026, 1040], [0, 1, 1, 0]),
        scale: motion(frame, [930, 940, 1018, 1028, 1040], [0.65, 0.78, 1.8, 1.3, 0.9]),
      }}
    >
      <svg className="h-[76%] w-[76%]" viewBox="0 0 100 100" fill="none">
        <circle
          className="text-teal"
          cx="50"
          cy="50"
          r="29"
          stroke="currentColor"
          strokeWidth="16"
        />
        <path
          d="M34 29a29 29 0 0 1 22-8"
          className="text-surface"
          stroke="currentColor"
          strokeOpacity=".65"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function OutcomeTag({ terminal }: { terminal: VisibleCandidate["responses"][number]["terminal"] }) {
  const score = terminal.score;
  return (
    <Tag tone={scoreTone(score)}>
      {outcomeLabel(terminal)}
      <br />
      <b className="text-[28px]">{scoreText(score)}</b>
    </Tag>
  );
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <Tag tone={scoreTone(score)}>
      <b className="text-[28px]">{scoreText(score)}</b>
    </Tag>
  );
}

function ValueToken({
  frame,
  start,
  end,
  from,
  to,
  score,
  visible,
}: {
  frame: number;
  start: number;
  end: number;
  from: [number, number];
  to: [number, number];
  score: number;
  visible: number;
}) {
  const t = motion(frame, [start, end], [0, 1]);
  const midY = (from[1] + to[1]) / 2;
  const x =
    (1 - t) ** 3 * from[0] +
    3 * (1 - t) ** 2 * t * from[0] +
    3 * (1 - t) * t ** 2 * to[0] +
    t ** 3 * to[0];
  const y =
    (1 - t) ** 3 * from[1] +
    3 * (1 - t) ** 2 * t * midY +
    3 * (1 - t) * t ** 2 * midY +
    t ** 3 * to[1];

  return (
    <div
      className="absolute z-[6]"
      style={{
        left: x - 22,
        top: y - 20,
        opacity: visible * motion(frame, [start, start + 5, end, end + 7], [0, 1, 1, 0]),
      }}
    >
      <ScoreBadge score={score} />
    </div>
  );
}

function Cursor({ frame, move }: { frame: number; move: number }) {
  return (
    <svg
      className="absolute h-[75px] w-[60px]"
      width="60"
      height="75"
      viewBox="0 0 60 75"
      style={{
        left: motion(frame, [20, 65], [850, 540 + ((move % 3) - 1) * 174]),
        top: motion(frame, [20, 65], [970, 675 + (Math.floor(move / 3) - 1) * 174]),
        opacity: motion(frame, [0, 18, 82, 105], [0, 1, 1, 0]),
        scale: motion(frame, [65, 70, 80], [1, 0.88, 1]),
      }}
    >
      <path
        d="M5 3 L9 57 L23 44 L34 67 L44 62 L33 39 L52 36 Z"
        className="fill-surface stroke-ink"
        strokeWidth="3"
      />
    </svg>
  );
}
