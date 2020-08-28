create database if not exists regv2;

create table if not exists course
(
	id int auto_increment
		primary key,
	year text null,
	semester text null,
	courseno text null,
	seclec text null,
	seclab text null,
	crelec text null,
	crelab text null,
	room text null,
	max int null
);

create table if not exists instructor
(
	id int auto_increment
		primary key,
	name text null
);

create table if not exists course_instructor
(
	course_id int null,
	instructor_id int null,
	constraint course_instructor_course_id_fk
		foreign key (course_id) references course (id),
	constraint course_instructor_instructor_id_fk
		foreign key (instructor_id) references instructor (id)
);

create table if not exists time
(
	id int auto_increment
		primary key,
	course_id int null,
	day text null,
	btime text null,
	ftime text null,
	constraint time_course_id_fk
		foreign key (course_id) references course (id)
);
