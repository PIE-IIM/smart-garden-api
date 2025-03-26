start:
	npx ts-node src/index.ts

migrate:
	@read -p "Commit of your migration: " msg; \
	npx prisma migrate dev --name $$msg

reset-db:
	npx prisma migrate reset

clear-migrations:
	rm -rf prisma/migrations
