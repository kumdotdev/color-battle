const WebsocketServer = require('ws').Server;
const Session = require('./session');
const Client = require('./client');
const Game = require('./game');

const server = new WebsocketServer({ port: 9000 });
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
  console.log('Creating session', session);
  sessions.set(id, session);
  return session;
}

function getSession(id) {
  return sessions.get(id);
}

function createGame(session) {
  if (games.has(session.id)) {
    throw new Error(`Game for session ${id} already exists`);
  }
  const game = new Game(session);
  console.log('Creating game', game);
  games.set(session.id, game);
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

server.on('connection', (ws) => {
  console.log('Connection established');
  const client = createClient(ws);

  ws.on('message', (msg) => {
    console.log(`Received message => ${msg}`);
    const data = JSON.parse(msg);

    if (data.type === 'create-session') {
      const session = createSession();
      session.join(client);
      client.send({ type: 'session-created', id: session.id });
      const game = createGame(session);
      game.broadcastGameState();
    } else if (data.type === 'join-session') {
      const session = getSession(data.id) || createSession(data.id);
      session.join(client);
      broadcastSession(session);
      const game = getGame(session.id) || createGame(session);
      game.reset();
    } else if (data.type === 'answer') {
      const session = getSession(data.id);
      const game = getGame(session.id);
      game.checkAnswer(data.color);
    }
    console.log('Sessions', sessions);
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
