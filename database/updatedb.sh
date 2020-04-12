mongoimport -d fifa -c games --file=games.csv --type=csv --headerline
mongoimport -d fifa -c saves --file=saves.csv --type=csv --headerline --mode upsert
mongoimport -d fifa -c teams --file=teams.csv --type=csv --headerline --mode upsert
mongoimport -d fifa -c competitions --file=competitions.csv --type=csv --headerline --mode upsert
mongoimport -d fifa -c divisions --file=divisions.csv --type=csv --headerline --mode upsert
mongoimport -d fifa -c teamsins --file=teamsIn.csv --type=csv --headerline --mode upsert
# mongoimport -d fifa -c playerdynamicinfos --file=players.csv --type=csv --headerline --mode upsert
# mongo < commands.txt