-- up begin
create table "album" (id int primary key, title varchar(100));
-- up end
-- down begin
drop table "album";
-- down end