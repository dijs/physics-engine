import { useGame } from './Game';

export default function Status() {
  const { game, fen } = useGame();
  return (
    <div>
      status
      <hr />
      <div>{game.turn()}</div>
      {game.isGameOver() ? <div>game over</div> : <></>}
      {game.isCheckmate() ? <div>checkmate</div> : <></>}
      {game.isDraw() ? <div>draw</div> : <></>}
      {game.isStalemate() ? <div>stalemate</div> : <></>}
      {fen}
    </div>
  );
}
