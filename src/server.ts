/* eslint-disable no-console */
import { Server } from 'http'
import mongoose from 'mongoose'
import app from './app'
import { envVars } from './app/config/env'
import { seedSuperAdmin } from './app/utils/seedSuperAdmin'

let server: Server

const port = envVars.PORT || 3000

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL)
    console.log('MongoDB connected successfully: ')

    if (envVars.NODE_ENV !== 'production') {
      server = app.listen(port || 8080, () => {
        console.log(`Server running locally on port: ${port}`)
      })
    } else {
      console.log('Production')
    }
  } catch (error) {
    console.log('MongoDB connected Error: ', error)
    process.exit(1)
  }
}

;(async () => {
  await startServer()
  await seedSuperAdmin()
})()

// for live server signal
process.on('SIGTERM', (err) => {
  console.log('Signal recieved ... server shuting down', err)

  if (server) {
    server.close(() => {
      process.exit(1)
    })
  }
  process.exit(1)
})
// local terminal signal
process.on('SIGINT', (err) => {
  console.log('Signal recieved ... server shuting down', err)

  if (server) {
    server.close(() => {
      process.exit(1)
    })
  }
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  console.log('unhandledRejection detected ... server shuting down', err)

  if (server) {
    server.close(() => {
      process.exit(1)
    })
  }
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  console.log('uncaught Exception detected ... server shuting down', err)

  if (server) {
    server.close(() => {
      process.exit(1)
    })
  }
  process.exit(1)
})

export default app
