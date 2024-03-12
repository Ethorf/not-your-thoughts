const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') }) // Use absolute path for .env file
const { exec } = require('child_process')

const backupDirectory = path.join(__dirname, '..', 'dbBackups')
const sourceDatabaseConnectionString = process.env.DATABASE_URL
const dumpFileName = path.join(backupDirectory, 'dbBackup.sql')

const command = `/Library/PostgreSQL/16/bin/pg_dump -Fc -v -d "${sourceDatabaseConnectionString}" -f "${dumpFileName}"`

async function createBackup() {
  try {
    await execCommand(command)
    console.log(`Backup created successfully: ${dumpFileName}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
  }
}

async function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

createBackup()
