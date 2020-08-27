const mysql = require('mysql');
const MySQLEvents = require('@rodrigogs/mysql-events');
const ora = require('ora'); // cool spinner
const spinner = ora({
  text: '🛸 Waiting for database events... 🛸',
  color: 'blue',
  spinner: 'dots2'
});

const program = async () => {
  console.log(process.env.MYSQL_URL)
  const connection = mysql.createConnection(process.env.MYSQL_URL);

  const instance = new MySQLEvents(connection, {
    startAtEnd: true // to record only the new binary logs, if set to false or you didn'y provide it all the events will be console.logged after you start the app
  });

  await instance.start();

  instance.addTrigger({
    name: 'monitoring all statments',
    expression: 'test.*', // listen to test database !!!
    statement: MySQLEvents.STATEMENTS.ALL, // you can choose only insert for example MySQLEvents.STATEMENTS.INSERT, but here we are choosing everything
    onEvent: e => {
      console.log(e);
      spinner.succeed('👽 _EVENT_ 👽');
      spinner.start();
    }
  });

  instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
  instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
};

program()
  .then(spinner.start.bind(spinner))
  .catch(console.error);
