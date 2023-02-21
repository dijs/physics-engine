import { findMaxMove, getBoardScore } from 'src/utils';
import { useGame } from './Game';

export default function Status() {
  const { game, fen, depth, setDepth, makeMove, findAiMove } = useGame();

  function tick() {
    const move = findMaxMove(game, 2);
    if (move) {
      makeMove(move);
    }
  }

  return (
    <div>
      status
      <hr />
      <div>turn = {game.turn()}</div>
      <div>white score = {getBoardScore(game, 'w')}</div>
      <div>black score = {getBoardScore(game, 'b')}</div>
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
