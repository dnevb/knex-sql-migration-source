-- no transaction
-- down begin
drop table genre;
-- down end
-- up begin
-- genre table
create table genre (id int primary key, name varchar(100));
-- up end