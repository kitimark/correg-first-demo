create database if not exists regv1;

use regv1;

create table if not exists course
(
	id int auto_increment
		primary key,
	year tinytext null,
	semester text null,
	courseno tinytext null,
	seclec text null,
	seclab text null,
	crelec int null,
	crelab int null,
	day_1 text null,
	day_2 text null,
	day_3 text null,
	btime_1 text null,
	ftime_1 text null,
	btime_2 text null,
	ftime_2 text null,
	btime_3 text null,
	ftime_3 text null,
	room text null,
	instructor_id_1 int null,
	instructor_name_1 text null,
	instructor_id_2 int null,
	instructor_name_2 text null,
	instructor_id_3 int null,
	instructor_name_3 text null,
	max int null
);
