const { Client } = require('pg');

const passwords = ['postgres', 'admin', 'root', '1234', 'password', '123456', '', 'saisu', 'stocksense'];
const user = 'postgres';

async function testPasswords() {
  for (const password of passwords) {
    const client = new Client({
      user: user,
      host: 'localhost',
      database: 'postgres',
      password: password,
      port: 5432,
    });

    try {
      await client.connect();
      console.log('SUCCESS: Password is: ' + (password === '' ? '<empty>' : password));
      await client.end();
      return;
    } catch (err) {
      // console.error('Failed for: ' + password + ' - ' + err.message);
    }
  }
  console.log('FAILED ALL PASSWORDS');
}

testPasswords();
