const { exec } = require('child_process')
const { parse } = require('pg-connection-string')

// Get connection details from DATABASE_URL environment variable
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set.')
  process.exit(1)
}

// Parse connection string to extract connection details
const pgConfig = parse(connectionString)

// Set PGPASSWORD environment variable to provide the password
process.env.PGPASSWORD = pgConfig.password

// Backup file name
const backupFileName = 'backup.sql'

// Command to execute pg_dump with connection details
let pgDumpCommand = `pg_dump -h ${pgConfig.host} -U ${pgConfig.user} -d ${pgConfig.database} > ${backupFileName}`

// Append port to pg_dump command if it's present in the connection string
if (pgConfig.port) {
  pgDumpCommand += ` -p ${pgConfig.port}`
}

// Execute pg_dump command
exec(pgDumpCommand, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`)
    return
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`)
    return
  }
  console.log(`stdout: ${stdout}`)
  console.log('Backup successful!')
})
