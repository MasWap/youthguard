const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'timeguarduser',
  password: 'timeguardpassword',
  database: 'timeguard',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await pool.query(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );
    if (rows.length > 0) {
      const match = await bcrypt.compare(password, rows[0].password);
      if (match) {
        const token = uuidv4(); // Générer un nouvel UUID
        res.json({ 
          success: true, 
          user: { id: rows[0].id, username: rows[0].username },
          token // Renvoyer le token UUID
        });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

async function getAccountCount() {
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM admins');
  return rows[0].count;
}

app.post('/register', async (req, res) => {
  try {
      const { username, password, ip } = req.body;

      // Vérifier si l'adresse IP existe déjà
      const [existingIP] = await pool.query('SELECT * FROM admins WHERE ip_address = ?', [ip]);
      if (existingIP.length > 0) {
          return res.status(403).json({ success: false, message: 'Un compte est déjà enregistré avec cette adresse IP.' });
      }

      // Vérifier si l'utilisateur existe déjà
      const [existingUser] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);
      if (existingUser.length > 0) {
          return res.status(409).json({ success: false, message: 'Nom d\'utilisateur déjà existant.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await pool.query('INSERT INTO admins (username, password, ip_address) VALUES (?, ?, ?)', [username, hashedPassword, ip]);
      res.json({ success: true, user: { id: result.insertId, username } });
  } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/can-register', async (req, res) => {
  const ip = req.query.ip; // Récupérer l'IP depuis la requête
  try {
      const [rows] = await pool.query('SELECT COUNT(*) as count FROM admins WHERE ip_address = ?', [ip]);
      const canRegister = rows[0].count === 0; // Si aucun compte n'existe pour cette IP
      res.json({ canRegister });
  } catch (error) {
      console.error('Can register check error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/logout', (req, res) => {
  // Dans une application réelle, vous pourriez gérer la session ici
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username FROM admins');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Liste des utilisateurs avec gestion
app.delete('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const [result] = await pool.query('DELETE FROM admins WHERE id = ?', [userId]);
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'User deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route pour récupérer tous les enfants
app.get('/kids', async (req, res) => {
  try {
    const [kids] = await pool.query('SELECT id, username, birth_date, is_active, max_time FROM kids');
    res.json(kids);
  } catch (error) {
    console.error('Get kids error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/kids', async (req, res) => {
  const { username, birth_date, is_active, max_time } = req.body; // Récupérer les données de l'enfant
  try {
    const [result] = await pool.query(
      'INSERT INTO kids (username, birth_date, is_active, max_time) VALUES (?, ?, ?, ?)',
      [username, birth_date, is_active, max_time]
    );
    res.json({ id: result.insertId, username, birth_date, is_active, max_time }); // Retourner les détails de l'enfant ajouté
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'enfant:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route pour récupérer les détails d'un enfant spécifique avec les tags associés
app.get('/kids/:id', async (req, res) => {
  const kidId = req.params.id;
  try {
    const [rows] = await pool.query(`
      SELECT k.*, 
             GROUP_CONCAT(kt.tag_id) AS tag_ids, 
             GROUP_CONCAT(t.libelle) AS bannedTags
      FROM kids k
      LEFT JOIN kids_tags kt ON k.id = kt.kid_id
      LEFT JOIN tags t ON kt.tag_id = t.id
      WHERE k.id = ?
      GROUP BY k.id
    `, [kidId]);

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ success: false, message: 'Kid not found' });
    }
  } catch (error) {
    console.error('Get kid details error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route pour mettre à jour les tags associés à un enfant
app.put('/kids/:id/tags', async (req, res) => {
  const kidId = req.params.id;
  const { tagIds } = req.body; // Récupérer les IDs des tags à associer

  try {
    // Supprimer les associations existantes
    await pool.query('DELETE FROM kids_tags WHERE kid_id = ?', [kidId]);

    // Ajouter les nouvelles associations
    const insertPromises = tagIds.map(tagId => {
      return pool.query('INSERT INTO kids_tags (kid_id, tag_id) VALUES (?, ?)', [kidId, tagId]);
    });
    await Promise.all(insertPromises);

    res.json({ success: true, message: 'Tags updated successfully' });
  } catch (error) {
    console.error('Update tags error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route pour mettre à jour les détails d'un enfant
app.put('/kids/:id', async (req, res) => {
  const kidId = req.params.id;
  const { username, birth_date, is_active, max_time } = req.body; // Assurez-vous que ces champs existent dans votre requête
  try {
    const [result] = await pool.query(
      'UPDATE kids SET username = ?, birth_date = ?, is_active = ?, max_time = ? WHERE id = ?',
      [username, birth_date, is_active, max_time, kidId] // Ajout de max_time
    );
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Kid updated successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Kid not found' });
    }
  } catch (error) {
    console.error('Update kid error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route pour supprimer un enfant
app.delete('/kids/:id', async (req, res) => {
  const kidId = req.params.id;
  try {
    const [result] = await pool.query('DELETE FROM kids WHERE id = ?', [kidId]);
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Kid deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Kid not found' });
    }
  } catch (error) {
    console.error('Delete kid error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route pour activer un enfant
app.put('/kids/:id/activate', async (req, res) => {
  const kidId = req.params.id;
  const { uuid, is_active } = req.body; // Récupérer l'UUID et l'état depuis le corps de la requête

  try {
    // Si l'enfant doit être activé
    if (is_active) {
      // Vérifier si un enfant est déjà actif pour cet UUID
      const [activeKids] = await pool.query('SELECT * FROM kids WHERE is_active = ? AND uuid = ?', [true, uuid]);
      if (activeKids.length > 0) {
        return res.status(403).json({ success: false, message: 'Un enfant est déjà actif sur cet ordinateur.' });
      }

      // Désactiver tous les autres enfants
      await pool.query('UPDATE kids SET is_active = ? WHERE is_active = ?', [false, true]);

      // Activer l'enfant spécifié
      await pool.query('UPDATE kids SET is_active = ?, uuid = ? WHERE id = ?', [true, uuid, kidId]);
    } else {
      // Si l'enfant doit être désactivé
      await pool.query('UPDATE kids SET is_active = ? WHERE id = ?', [false, kidId]);
    }

    res.json({ success: true, message: 'État de l\'enfant mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'activation de l\'enfant:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route pour récupérer l'enfant actif
app.get('/kids/active', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM kids WHERE is_active = ?', [true]);
    if (rows.length > 0) {
      res.json(rows[0]); // Renvoyer le premier enfant actif
    } else {
      res.status(404).json({ success: false, message: 'Enfant non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'enfant actif:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route pour récupérer tous les tags
app.get('/tags', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tags'); // Assurez-vous que cette requête est correcte
    res.json(rows);
  } catch (error) {
    console.error('Erreur lors de la récupération des tags:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route pour ajouter un nouveau tag
app.post('/tags', async (req, res) => {
  const { libelle } = req.body; // Récupérer le libellé du tag
  try {
    const [result] = await pool.query('INSERT INTO tags (libelle) VALUES (?)', [libelle]);
    res.status(201).json({ success: true, id: result.insertId, libelle }); // Retourner le tag ajouté
  } catch (error) {
    console.error('Erreur lors de l\'ajout du tag:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route pour supprimer un tag
app.delete('/tags/:id', async (req, res) => {
  const tagId = req.params.id; // Récupérer l'ID du tag à supprimer
  try {
    const [result] = await pool.query('DELETE FROM tags WHERE id = ?', [tagId]);
    if (result.affectedRows > 0) {
      res.json({ success: true, message: 'Tag deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Tag not found' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du tag:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});