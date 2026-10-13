import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');
const PORT = 3001;

// Helper to read db.json
function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { users: [], projects: [], sessions: [], documents: [], exports: [], settings: {} };
  }
}

// Helper to write db.json atomically
function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing db.json:', err);
    return false;
  }
}

// Helper for Password Hashing (SHA-256 with per-user cryptographic salt)
function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(password + salt).digest('hex');
}

// Helper to authenticate request from Authorization: Bearer <token>
function getAuthUser(req, db) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7).trim();
  const session = db.sessions.find((s) => s.token === token);
  if (!session) return null;
  const user = db.users.find((u) => u.id === session.userId);
  return user ? { user, session } : null;
}

// CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJSON(res, statusCode, data) {
  setCorsHeaders(res);
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  setCorsHeaders(res);

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    let parsedBody = {};
    if (body) {
      try {
        parsedBody = JSON.parse(body);
      } catch {
        parsedBody = {};
      }
    }

    const db = readDB();

    // -------------------------------------------------------------
    // Health Check
    // -------------------------------------------------------------
    if (pathname === '/api/health' && req.method === 'GET') {
      return sendJSON(res, 200, { status: 'ok', service: 'FORMA 3D Local Server', dbVersion: db.version });
    }

    // -------------------------------------------------------------
    // Auth: Register
    // -------------------------------------------------------------
    if (pathname === '/api/auth/register' && req.method === 'POST') {
      const { email, password, fullName } = parsedBody;

      if (!email || !password || password.length < 6) {
        return sendJSON(res, 400, { error: 'Correo electrónico válido y contraseña de al menos 6 caracteres requeridos.' });
      }

      const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        return sendJSON(res, 400, { error: 'Este correo electrónico ya está registrado.' });
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = hashPassword(password, salt);
      const newUser = {
        id: `usr-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
        email: email.trim().toLowerCase(),
        fullName: fullName || email.split('@')[0],
        organization: 'Estudio Técnico BIM',
        passwordHash,
        salt,
        createdAt: new Date().toISOString(),
      };

      db.users.push(newUser);

      // Create session token
      const token = crypto.randomUUID();
      db.sessions.push({
        token,
        userId: newUser.id,
        createdAt: new Date().toISOString(),
      });

      writeDB(db);

      // Sanitize user: Never return hash or salt to client!
      const userSafe = {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        organization: newUser.organization,
        createdAt: newUser.createdAt,
      };

      return sendJSON(res, 201, { user: userSafe, token });
    }

    // -------------------------------------------------------------
    // Auth: Login
    // -------------------------------------------------------------
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const { email, password } = parsedBody;

      if (!email || !password) {
        return sendJSON(res, 400, { error: 'Introduce tu correo y contraseña.' });
      }

      const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        return sendJSON(res, 401, { error: 'Credenciales inválidas.' });
      }

      const testHash = hashPassword(password, user.salt);
      if (testHash !== user.passwordHash) {
        return sendJSON(res, 401, { error: 'Credenciales inválidas.' });
      }

      // Generate session token
      const token = crypto.randomUUID();
      db.sessions.push({
        token,
        userId: user.id,
        createdAt: new Date().toISOString(),
      });

      writeDB(db);

      const userSafe = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        organization: user.organization,
        createdAt: user.createdAt,
      };

      return sendJSON(res, 200, { user: userSafe, token });
    }

    // -------------------------------------------------------------
    // Auth: Me (Session check)
    // -------------------------------------------------------------
    if (pathname === '/api/auth/me' && req.method === 'GET') {
      const auth = getAuthUser(req, db);
      if (!auth) {
        return sendJSON(res, 401, { error: 'No autorizado / Sesión expirada.' });
      }

      const userSafe = {
        id: auth.user.id,
        email: auth.user.email,
        fullName: auth.user.fullName,
        organization: auth.user.organization,
        createdAt: auth.user.createdAt,
      };

      return sendJSON(res, 200, { user: userSafe });
    }

    // -------------------------------------------------------------
    // Auth: Logout
    // -------------------------------------------------------------
    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        db.sessions = db.sessions.filter((s) => s.token !== token);
        writeDB(db);
      }
      return sendJSON(res, 200, { success: true });
    }

    // -------------------------------------------------------------
    // Projects: List (User-isolated!)
    // -------------------------------------------------------------
    if (pathname === '/api/projects' && req.method === 'GET') {
      const auth = getAuthUser(req, db);
      const userId = auth ? auth.user.id : null;

      // Filter projects: return only user's projects, or demo public projects
      const userProjects = db.projects.filter((p) => !p.ownerId || p.ownerId === userId);
      return sendJSON(res, 200, userProjects);
    }

    // -------------------------------------------------------------
    // Projects: Save / Create / Update
    // -------------------------------------------------------------
    if (pathname === '/api/projects' && req.method === 'POST') {
      const auth = getAuthUser(req, db);
      const userId = auth ? auth.user.id : (parsedBody.metadata?.ownerId || 'usr-local');

      const projectData = parsedBody;
      const projId = projectData.metadata?.id || `proj-${Date.now()}`;

      // Check existing project ownership
      const existingIdx = db.projects.findIndex((p) => p.id === projId);
      if (existingIdx >= 0) {
        const existing = db.projects[existingIdx];
        if (existing.ownerId && existing.ownerId !== userId) {
          return sendJSON(res, 403, { error: 'No tienes autorización para modificar este proyecto.' });
        }
        db.projects[existingIdx] = {
          ...projectData.metadata,
          id: projId,
          ownerId: userId,
          content: projectData,
          updatedAt: new Date().toISOString(),
        };
      } else {
        db.projects.push({
          ...projectData.metadata,
          id: projId,
          ownerId: userId,
          content: projectData,
          updatedAt: new Date().toISOString(),
        });
      }

      writeDB(db);
      return sendJSON(res, 200, { success: true, id: projId });
    }

    // -------------------------------------------------------------
    // Projects: Get by ID
    // -------------------------------------------------------------
    if (pathname.startsWith('/api/projects/') && req.method === 'GET') {
      const projId = pathname.substring('/api/projects/'.length);
      const proj = db.projects.find((p) => p.id === projId);
      if (!proj) {
        return sendJSON(res, 404, { error: 'Proyecto no encontrado.' });
      }

      const auth = getAuthUser(req, db);
      if (proj.ownerId && (!auth || auth.user.id !== proj.ownerId)) {
        return sendJSON(res, 403, { error: 'Acceso denegado a proyecto privado.' });
      }

      return sendJSON(res, 200, proj.content || proj);
    }

    // -------------------------------------------------------------
    // Projects: Delete
    // -------------------------------------------------------------
    if (pathname.startsWith('/api/projects/') && req.method === 'DELETE') {
      const projId = pathname.substring('/api/projects/'.length);
      const existing = db.projects.find((p) => p.id === projId);

      if (!existing) {
        return sendJSON(res, 404, { error: 'Proyecto no encontrado.' });
      }

      const auth = getAuthUser(req, db);
      if (existing.ownerId && (!auth || auth.user.id !== existing.ownerId)) {
        return sendJSON(res, 403, { error: 'No tienes autorización para eliminar este proyecto.' });
      }

      db.projects = db.projects.filter((p) => p.id !== projId);
      writeDB(db);
      return sendJSON(res, 200, { success: true });
    }

    // Default 404
    sendJSON(res, 404, { error: 'Endpoint no encontrado' });
  });
});

server.listen(PORT, () => {
  console.log(`[FORMA 3D Local Server] Running on http://localhost:${PORT}`);
  console.log(`[Database] Connected to ${DB_PATH}`);
});
