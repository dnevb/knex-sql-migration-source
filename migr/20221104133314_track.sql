-- up begin
create table track (
  id int primary key,
  title varchar(100),
  album_id int,
  genre_id int,
  constraint album foreign key(album_id) references album(id),
  constraint genre foreign key(genre_id) references genre(id)
);
-- up end
-- down begin
drop table track;
-- down end