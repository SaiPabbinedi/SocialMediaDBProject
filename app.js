const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { randomInt } = require('crypto');

const app = express();
const port = 5501;



// Use CORS middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'SocialAdConnectDB',
  password: 'admin123',
  port: 5432,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

app.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  try {
      
      const client = await pool.connect();
      const result = await client.query(
          'SELECT * FROM users WHERE username = $1 AND password_hash = $2',
          [username, password]
      );

      client.release();

      if (result.rows.length > 0) {
          res.json({ success: true, message: 'Login successful' });
      } else {
          res.json({ success: false, message: 'Invalid credentials' });
      }
  } catch (error) {
      console.error('Error executing database query:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/signup', upload.single('profile_picture'), async (req, res) => {
  const { username, email, gender, birthday, bio, password, password1 } = req.body;

  if (password !== password1) {
    return res.status(400).json({ success: false, error: 'Passwords do not match' });
  }

  try {
    const profilePicturePath = req.file.path;

    const result = await pool.query(
      'INSERT INTO users (username, email, gender, birthday, bio, password_hash, picture_path) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [username, email, gender, birthday, bio, password, profilePicturePath]
    );

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.post('/api/insertAd', upload.single('adpicture'), async (req, res) => {
  const { advertiser_name, url_link } = req.body;

  try {
    const adpicture_path = req.file.path;

    const result = await pool.query(
      'INSERT INTO advertisers (advertiser_name, url_link, adpicture_path) VALUES ($1, $2, $3) RETURNING *',
      [advertiser_name, url_link, adpicture_path]
    );

    res.json({ success: true, advertiser: result.rows[0] });
  } catch (error) {
    console.error('Error during advertiser insertion:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});




app.get('/api/getUserData', async (req, res) => {
  try {
      const username = req.query.username;
      const userData = await fetchUserDataFromDatabase(username);

      res.json(userData);
  } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/api/getTenPosts', async (req, res) => {
  try {
    const queryResult = await pool.query(`
      SELECT up.* FROM (
        SELECT username, MAX(created_at) as latest_post_time
        FROM user_posts
        GROUP BY username
      ) as lp
      JOIN user_posts up ON lp.username = up.username AND lp.latest_post_time = up.created_at
      ORDER BY up.created_at DESC
      LIMIT 10
    `);app.get('/api/getUserData', async (req, res) => {
  try {
    const username = req.query.username;
    const userData = await fetchUserDataFromDatabase(username);

    res.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/getTenPosts', async (req, res) => {
  try {
    const queryResult = await pool.query(`
      SELECT up.* FROM (
        SELECT username, MAX(created_at) as latest_post_time
        FROM user_posts
        GROUP BY username
      ) as lp
      JOIN user_posts up ON lp.username = up.username AND lp.latest_post_time = up.created_at
      ORDER BY up.created_at DESC
      LIMIT 10
    `);
      
    const postsData = queryResult.rows;
      
    res.json(postsData);
  } catch (error) {
    console.error('Error fetching posts data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
      
    const postsData = queryResult.rows;
      
    res.json(postsData);
  } catch (error) {
    console.error('Error fetching posts data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/api/getTenPosts', async (req, res) => {
  try {
    // Fetch 10 posts with different usernames
      const queryResult = await pool.query(
      'SELECT * FROM user_posts GROUP BY username ORDER BY created_at DESC LIMIT 10'
      );
      
      const postsData = queryResult.rows;
      
      res.json(postsData);
  } catch (error) {
  console.error('Error fetching posts data:', error);
  res.status(500).json({ error: 'Internal Server Error' });
  }
  });

// Endpoint to insert posts
app.post('/api/insertPost', async (req, res) => {
  console.log('Received POST request at /api/insertPost');
  try {
    const { username, postContent } = req.body;

    // Validate if post content is not empty
    if (!postContent) {
      return res.status(400).json({ success: false, error: 'Post content cannot be empty' });
    }

    const currentDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const queryResult = await pool.query(
      'INSERT INTO user_posts (username, content, created_at) VALUES ($1, $2, $3) RETURNING *',
      [username, postContent, currentDate]
    );

    const insertedPost = queryResult.rows[0];
    res.json({ success: true, post: insertedPost });
  } catch (error) {
    console.error('Error inserting post:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



async function fetchUserDataFromDatabase(username) {
  try {
      const queryResult = await pool.query(
          'SELECT username, email, gender, birthday, bio, picture_path FROM public.users WHERE username = $1',
          [username]
      );

      const userData = queryResult.rows[0];

      return userData;
  } catch (error) {
      console.error('Error fetching user data from the database:', error);
      throw error; 
  }
}

// Function to generate a random integer between min and max (inclusive)
// function randomInt1(min, max) {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// // Store a random number between 5 and 8 in the variable rnd
// let rnd = randomInt1(5, 8);


// async function fetchAdDataFromDatabase(){
//   try{
//     const queryResult = await pool.query(
//       'select advertiser_name, url_link, adpicture_path from advertisers where advertiser_id= $1',[rnd]
//     );
//       const adData = queryResult.rows[0];
//       return adData;
//     }catch(error) {
//       console.error('Error fetching ad data from the database:', error);
//       throw error;
   
//   }
// }


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});