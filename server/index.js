const process = require('process');
const http = require('http');
const express = require('express');
const ws = require('ws');
const Session = require('./session');
const Client = require('./client');
const Game = require('./game');

const app = express();
app.use(express.static('client'));

// Create a single HTTP server
const server = http.createServer(app);

// Create websocket server
const wss = new ws.Server({ server, path: '/ws' });

server.listen(process.env.EXPRESS_SERVER_PORT);
console.log('Server listen on port ', process.env.EXPRESS_SERVER_PORT);
console.log('WebSocketServer listen on port ', process.env.EXPRESS_SERVER_PORT);
console.log(`WebSocketServer listen on path /ws`);

const sessions = new Map();
const games = new Map();

function createId(len = 6, chars = 'absdefghjkmnopqrstwxyz0123456789') {
  let id = '';
  while (len--) {
    id += chars[(Math.random() * chars.length) | 0];
  }
  return id;
}

function createClient(conn, id = createId()) {
  return new Client(conn, id);
}

function createSession(id = createId()) {
  if (sessions.has(id)) {
    throw new Error(`Session ${id} already exists`);
  }
  const session = new Session(id);
  // console.log('Creating session', session);
  sessions.set(id, session);
  return session;
}

function getSession(id) {
  return sessions.get(id);
}

function createGame(id) {
  if (games.has(id)) {
    throw new Error(`Game for session ${id} already exists`);
  }
  const session = getSession(id);
  const game = new Game(session);
  console.log('Creating game', game);
  games.set(id, game);
  return game;
}

function getGame(id) {
  return games.get(id);
}

function broadcastSession(session) {
  const clients = [...session.clients];
  clients.forEach((client) => {
    client.send({
      type: 'session-broadcast',
      session: session.id,
      peers: {
        you: client.id,
        clients: clients.map((client) => client.id),
      },
    });
  });
}

wss.on('connection', (ws) => {
  console.log('Connection established');
  const client = createClient(ws);

  ws.on('message', (msg) => {
    console.log(`Received message => ${msg}`);
    const data = JSON.parse(msg);

    if (data.type === 'create-session') {
      const session = createSession();
      session.join(client);
      client.send({ type: 'session-created', id: session.id });
      broadcastSession(session);
      const game = createGame(session.id);
      game.broadcastGameState();
    } else if (data.type === 'join-session') {
      const session = getSession(data.id) || createSession(data.id);
      session.join(client);
      broadcastSession(session);
      const game = getGame(session.id) || createGame(session.id);
      console.log(game);
      game.reset();
    } else if (data.type === 'answer') {
      const session = getSession(data.id);
      const game = getGame(session.id);
      game.checkAnswer(data.index);
    } else if (data.type === 'reset') {
      const session = getSession(data.id);
      const game = getGame(session.id);
      game.reset();
    } else if (data.type === 'play-mode') {
      const session = getSession(data.id);
      const game = getGame(session.id);
      game.setMode(data.mode);
    }

    // console.log('Sessions', sessions);
    // console.log('Gamess', games);
  });

  ws.on('close', () => {
    console.log('Connection closed');
    const session = client.session;
    if (session) {
      session.leave(client);
      if (session.clients.size === 0) {
        sessions.delete(session.id);
      }
    }
    broadcastSession(session);
  });
});
