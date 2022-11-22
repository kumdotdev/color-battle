class Client {
  constructor(ws, id) {
    this.ws = ws;
    this.id = id;
    this.session = null;
  }

  send(data) {
    const message = JSON.stringify(data);
    console.log('Sending message to client: ', message);
    this.ws.send(message, function ack(error) {
      if (error) {
        console.error('Message failed', message, error);
      }
    });
  }
}

module.exports = Client;
