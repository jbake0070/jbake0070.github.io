export default function handler(req, res) {
  const { lobby } = req.query;
  res.status(200).json({ moves: games[lobby]?.moves || [] });
}
