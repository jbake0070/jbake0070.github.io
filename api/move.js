let games = {}; 

export default function handler(req, res) {
  const { lobby, move } = req.body;

  if (!games[lobby]) {
    games[lobby] = { moves: [] };
  }
  games[lobby].moves.push(move);

  res.status(200).json({ status: 'ok' });
  console.log("move made: " );
  console.log(games[lobby]);
}
