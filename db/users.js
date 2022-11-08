const client = require("./client");
const bcrypt = require("bcrypt")

// database functions

// user functions
async function createUser({ username, password }) {
  const SALT_COUNT = 10
  const hashedPassword = await bcrypt.hash(password, SALT_COUNT)

  try{
  const {rows:[users]} = await client.query(`
  INSERT INTO users(username, password)
  VALUES($1, $2)
  ON CONFLICT(username) DO NOTHING
  RETURNING * ;
  `, [username, password]);

  return users;
  } catch (error) {
    console.error("Error creating user!")
    throw error;
  }

}


async function getUser({ username, password }) {
  const user = await getUserByUsername(username);
  const hashedPassword = user.password
  const isValid = await bcrypt.compare(password, hashedPassword)
try {
  if (isValid) {
  const {rows} = await client.query(`
  SELECT id, username 
  FROM users;
  `);
  return rows;
}
} catch (error) {
  console.error("Error getting user!")
  throw error;
}
}

async function getUserById(userId) {
 try{
  const { rows: [ user ] } = await client.query(`
    SELECT id, username
    FROM users
    WHERE id=${ userId }
  `);
  if (!user) {
    return null
  }
  return user;
 } catch (error) {
  console.error("Error getting user by id!")
  throw error
 }
}

async function getUserByUsername(username) {
 try {
  const { rows: [user] } = await client.query(`
  SELECT *
  FROM users 
  WHERE username=$1
  `,[username])
 } catch (error) {
  console.error("Error getting user by username!")
  throw error;
 }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
