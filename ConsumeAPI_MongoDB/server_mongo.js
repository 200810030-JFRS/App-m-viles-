const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const uri = 'mongodb+srv://Francisco:db_Familia14356@francisco.g0hoy7v.mongodb.net/?appName=Francisco';
const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db('sample_mflix');
  const movies = db.collection('movies');

  app.get('/movies', async (req, res) => {
    try {
      const data = await movies
        .find({}, { projection: { _id: 1, poster: 1, title: 1, fullplot: 1 } })
        .limit(60)
        .toArray();

      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Error al consultar las películas.', error: error.message });
    }
  });

  app.post('/movies', async (req, res) => {
    try {
      const { title, fullplot, poster } = req.body || {};

      if (!title || !String(title).trim()) {
        return res.status(400).json({ message: 'El título es obligatorio.' });
      }

      const movie = {
        title: String(title).trim(),
        fullplot: fullplot ?? '',
        poster: poster ?? '',
      };

      const result = await movies.insertOne(movie);
      res.status(201).json({ ...movie, _id: result.insertedId });
    } catch (error) {
      res.status(500).json({ message: 'Error al guardar la película.', error: error.message });
    }
  });

  app.listen(4000, () => console.log('Server running at http://localhost:4000'));
}

main().catch((error) => {
  console.error('Error de conexión a MongoDB:', error);
  process.exit(1);
});