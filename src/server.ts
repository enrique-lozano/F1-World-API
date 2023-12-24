import app from './app';

const API_PORT = 3200;

app.listen(API_PORT, () => {
  console.log(`\nServer ready and listening on port ${API_PORT}.`);
  console.log('');
  console.log(
    `You can start making calls. Visit the docs at http://localhost:${API_PORT}/api/docs/ to check the avalaible endpoints.\n`
  );
});
