// load enviroment variables from .env file
require('dotenv').config()

const path = require('path')

const express = require('express')
const favicon = require('serve-favicon')
const cors = require('cors')

const DarkSky = require('dark-sky')
const RateLimit = require('express-rate-limit');

const app = express()

app.use(cors())
app.use(favicon(path.join(process.cwd(), 'favicon.ico')))

app.set('port', process.env.PORT || 3000)

app.enable('trust proxy')

const sleep = 600000; // 10 minutes

// the weather doesn't change too often
const limiter = new RateLimit({
  windowMs: sleep,
  max: 10, // limit each IP to 1 requests per windowMs
  delayMs: 0 // disable delaying - full speed until the max limit is reached
})

// Home
app.get('/', (req, res) => {
  res.send(`<div>Current time is: ${ new Date().toLocaleString() }</div>`)
})

// DarkSky API
const forecast = new DarkSky(process.env.API_KEY)

app.get('/api/v1/json', limiter, (req, res) => {
  const { lat, lon, time } = req.query

  forecast
    .latitude(lat)
    .longitude(lon)
    // .units(units)
    .time(time)
    .language('en')
    .exclude('minutely,hourly,alerts,flags')
    .get()
    .then(weather => res.status(200).json(weather))
    .catch(error => res.send(error))
})

app.listen(
  app.get('port'),
  () => console.log(`Server is listening at port ${app.get('port')}`)
)
