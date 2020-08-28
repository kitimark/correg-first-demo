const mysql = require('mysql');
const MySQLEvents = require('@rodrigogs/mysql-events');
const ora = require('ora'); // cool spinner
const spinner = ora({
  text: '🛸 Waiting for database events... 🛸',
  color: 'blue',
  spinner: 'dots2'
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 

const program = async () => {
  console.log(process.env.NEW_MYSQL_URL)
  console.log(process.env.LEGACY_MYSQL_URL)
  const masterConnection = mysql.createConnection(process.env.NEW_MYSQL_URL);

  const instance = new MySQLEvents(masterConnection, {
    startAtEnd: true // to record only the new binary logs, if set to false or you didn'y provide it all the events will be console.logged after you start the app
  });

  await instance.start();

  instance.addTrigger({
    name: 'monitoring all statments',
    expression: 'regv2.*', // listen to test database !!!
    statement: MySQLEvents.STATEMENTS.INSERT, // you can choose only insert for example MySQLEvents.STATEMENTS.INSERT, but here we are choosing everything
    onEvent: e => {
      console.log(e);
       
      const slaveConnection = mysql.createConnection(process.env.LEGACY_MYSQL_URL)

      const insertCourseInSlave = async () => {
        const { id, ...values } = e.affectedRows[0].after
        slaveConnection.query({
          sql: 'INSERT INTO course SET ?',
          values,
        })
      }

      const updateCourseTimeInSlave = async () => {
        const times = e.affectedRows.reduce(
          (accumulator, current, index) => {
            const { id, ...values } = current.after
            return {
              ...accumulator,
              [`day_${index + 1}`]: values.day,
              [`btime_${index + 1}`]: values.btime,
              [`ftime_${index + 1}`]: values.ftime,
            }
          }, 
          {}
        )

        // hack because it fast to run sql query
        await sleep(20)

        slaveConnection.query({
          sql: 'UPDATE course SET ? ORDER BY id DESC LIMIT 1',
          values: times,
        },
        (error, result) => {
          if (error) {
            throw error
          }
          console.log(result)
        })
      }

      const updateCourseInstructorInSlave = async () => {
        masterConnection.query({
          sql: `SELECT instructor_id, name as instructor_name 
            FROM instructor join course_instructor ci on instructor.id = ci.instructor_id
            WHERE ?`,
          values: {
            course_id: e.affectedRows[0].after.course_id
          }
        },
        (error, result) => {
          if (error) {
            throw error
          }
          console.log(result)

          const instructors = result.reduce(
            (accumulator, current, index) => {
              return {
                ...accumulator,
                [`instructor_id_${index + 1}`]: current.instructor_id,
                [`instructor_name_${index + 1}`]: current.instructor_name,
              }
            },
            {}
          )

          slaveConnection.query({
            sql: 'UPDATE course SET ? ORDER BY id DESC LIMIT 1',
            values: instructors,
          },
          (error, result) => {
            if (error) {
              throw error
            }
            console.log(result)
          })
        })
      }

      switch (e.table) {
        case 'course':
          insertCourseInSlave()
          break
        case 'course_instructor':
          updateCourseInstructorInSlave()
          break
        case 'time':
          updateCourseTimeInSlave()
          break;
      }

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
