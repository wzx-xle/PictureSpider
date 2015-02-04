create user picture@localhost identified by '1234!@#$';

grant select on *.* to picture@localhost;

GRANT SELECT, INSERT, UPDATE, REFERENCES, DELETE, CREATE, DROP, ALTER, INDEX, TRIGGER, CREATE VIEW, SHOW VIEW, EXECUTE, ALTER ROUTINE, CREATE ROUTINE, CREATE TEMPORARY TABLES, LOCK TABLES, EVENT ON `picture\_spider`.* TO 'picture'@'localhost';

GRANT GRANT OPTION ON `picture\_spider`.* TO 'picture'@'localhost';