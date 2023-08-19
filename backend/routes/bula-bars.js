
const express = require('express');
const router = express.Router();
const pgp = require('pg-promise')(/*options*/);
const db = pgp('bula-database://tuser:hayden99@localhost:5432/bula-database');


// Route to get all kava bar locations
router.get('/locations', async (req, res) => {
  try {
    // Query database for all kava bar locations pulling kava_bar_location: 'kl' and kava_bar_details: 'kd' tables
    const query = `
      SELECT kl.id, kl.latitude, kl.longitude, kl.address, kd.bar_name, kd.ratings, kd.about_bar
      FROM public.kava_bar_location kl
      INNER JOIN public.kava_bar_details kd ON kl.id = kd.id
    `;

    const kavaBars = await db.query(query);

    // Return as JSON
    res.json(kavaBars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching kava bar data.' });
  }
});

// Route to search kava bars by ID or name
router.get('/search', async (req, res) => {
  const { id, name } = req.query;

  try {
    let query = 'SELECT kl.id, kd.bar_name, kl.latitude, kl.longitude, kl.address, kd.ratings FROM public.kava_bar_location kl';
    query += ' INNER JOIN public.kava_bar_details kd ON kl.id = kd.id';
    const queryParams = [];

    if (id) {
      query += ' WHERE kl.id = $1';
      queryParams.push(id);
    } else if (name) {
      query += ' WHERE kd.bar_name ILIKE $1';
      queryParams.push(`%${name}%`);
    } else {
      res.status(400).json({ error: 'Missing search parameter: id or name' });
      return;
    }

    const kavaBars = await db.query(query, queryParams);

    // Return as JSON
    res.json(kavaBars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while searching for kava bars.' });
  }
});

module.exports = router;

