USE regv2;

START TRANSACTION;

INSERT INTO course(year, semester, courseno, seclec, seclab, crelec, crelab)
VALUES ('2020', '1', '261101', '1', null, null, null);

SELECT @course_id := LAST_INSERT_ID();

INSERT INTO course_instructor(course_id, instructor_id)
VALUES (@course_id, 1),
       (@course_id, 2);

INSERT INTO time(course_id, day, btime, ftime)
VALUES (@course_id, 'Mon', '8:00', '9:30'),
       (@course_id, 'Thu', '8:00', '9:30');

COMMIT;
