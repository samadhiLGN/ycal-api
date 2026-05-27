const router = require('express').Router()
const pool   = require('../db')
const auth   = require('../middleware/auth')

router.use(auth)

router.put('/', async (req, res) => {
  const { heightCm, weightKg, age, gender, activityLevel, dailyGoal } = req.body
  await pool.query(
    `UPDATE users
     SET height_cm = $2, weight_kg = $3, age = $4, gender = $5,
         activity_level = $6, daily_goal = COALESCE($7, daily_goal)
     WHERE id = $1`,
    [req.user.id, heightCm, weightKg, age, gender, activityLevel, dailyGoal || null]
  )
  res.json({ ok: true })
})

module.exports = router
