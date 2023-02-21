import { getBoardScore } from 'src/utils';
import { AiType, useGame } from './Game';

export default function Status() {
  const { game, fen, setAiType, aiType } = useGame();
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
      <div style={{ opacity: 0 }}>{fen}</div>
      <select
        value={aiType}
        onChange={(e) => setAiType(e.target.value as unknown as AiType)}
      >
        {Object.keys(AiType)
          .filter((k) => isNaN(k as any))
          .map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
      </select>
    </div>
  );
}
