// import { findMaxMove } from 'src/utils';
import { BLACK, WHITE } from 'chess.js';
import abMinMax from 'src/utils/abMinMax';
import { getBoardEvaluation } from 'src/utils/evals';
import { useGame } from './Game';

export default function Status() {
  const { game, fen, depth, setDepth, makeMove, findAiMove, makeRandomMove } =
    useGame();

  function makeBestMove() {
    const move = abMinMax(game, depth);
    if (move) {
      makeMove(move);
    }
  }

  return (
    <div>
      status
      <hr />
      <div>turn = {game.turn()}</div>
      <div>white score = {getBoardEvaluation(game, WHITE)}</div>
      <div>black score = {getBoardEvaluation(game, BLACK)}</div>
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
      <button onClick={makeBestMove}>Best Move</button>
      <br />
      <button onClick={makeRandomMove}>Random Move</button>
    </div>
  );
}
