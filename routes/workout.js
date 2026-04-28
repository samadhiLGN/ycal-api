const router = require('express').Router()
const pool   = require('../db')
const auth   = require('../middleware/auth')

router.use(auth)

router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT data FROM workout_plans WHERE user_id = $1',
    [req.user.id]
  )
  res.json(rows[0]?.data || { days: [] })
})

router.put('/', async (req, res) => {
  const { days } = req.body
  await pool.query(
    `INSERT INTO workout_plans (user_id, data)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET data = $2, updated_at = NOW()`,
    [req.user.id, JSON.stringify({ days })]
  )
  res.json({ ok: true })
})

module.exports = router
