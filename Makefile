deploy:
	cd client && npm run build
	cd server && npx tgcloud push
