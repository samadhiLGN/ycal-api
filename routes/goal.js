const router = require('express').Router()
const pool = require('../db')
const auth = require('../middleware/auth')

router.use(auth)

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT daily_goal FROM users WHERE id = $1', [req.user.id])
  res.json({ dailyGoal: rows[0]?.daily_goal ?? 2000 })
})

router.put('/', async (req, res) => {
  const { dailyGoal } = req.body
  await pool.query('UPDATE users SET daily_goal = $1 WHERE id = $2', [dailyGoal, req.user.id])
  res.json({ ok: true })
})

module.exports = router
