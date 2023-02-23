import { findMaxMove } from 'src/utils';
import { getBoardEvaluation } from 'src/utils/evals';
import { useGame } from './Game';

export default function Status() {
  const { game, fen, depth, setDepth, makeMove, findAiMove } = useGame();

  function tick() {
    const move = findMaxMove(game, depth);
    if (move) {
      makeMove(move);
    }
  }

  return (
    <div>
      status
      <hr />
      <div>turn = {game.turn()}</div>
      <div>white score = {getBoardEvaluation(game)}</div>
      <div>black score = {-getBoardEvaluation(game)}</div>
      {game.isGameOver() ? <div>game over</div> : <></>}
      {game.isCheckmate() ? <div>checkmate</div> : <></>}
      {game.isDraw() ? <div>draw</div> : <></>}
      {game.isStalemate() ? <div>stalemate</div> : <></>}
      <br />
      <textarea value={fen} readOnly />
      <br />
      <label>
        depth:
        <input
          type={'number'}
          value={depth}
          onChange={(e) => setDepth(e.target.valueAsNumber)}
        />
      </label>
      <br />
      <div>best move: {findAiMove()}</div>
      <button onClick={tick}>Tick</button>
    </div>
  );
}
