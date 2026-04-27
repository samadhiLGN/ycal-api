const router = require('express').Router()
const pool = require('../db')
const auth = require('../middleware/auth')

router.use(auth)

function formatEntry(r) {
  return {
    id: r.id,
    date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
    food: r.food,
    amount: Number(r.amount),
    unit: r.unit,
    calories: Number(r.calories),
  }
}

router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, date, food, amount, unit, calories FROM entries WHERE user_id = $1 ORDER BY created_at ASC',
    [req.user.id]
  )
  res.json(rows.map(formatEntry))
})

router.post('/', async (req, res) => {
  const { date, food, amount, unit, calories } = req.body
  const { rows } = await pool.query(
    'INSERT INTO entries (user_id, date, food, amount, unit, calories) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [req.user.id, date, food, amount, unit, calories]
  )
  res.json(formatEntry(rows[0]))
})

router.delete('/:id', async (req, res) => {
  await pool.query(
    'DELETE FROM entries WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  )
  res.json({ ok: true })
})

module.exports = router
