import { html, LitElement } from 'https://cdn.skypack.dev/lit?min';
import canvasConfetti from 'https://cdn.skypack.dev/canvas-confetti';
import { myStyles } from './styles.js';

const { floor } = Math;

const confetti = document.createElement('canvas');
const myConfetti = canvasConfetti.create(confetti, { resize: true });

class ColorBattle extends LitElement {
  static styles = [myStyles];

  static get properties() {
    return {
      state: { type: Object },
    };
  }

  constructor() {
    super();
    this.state = {};
  }

  connectedCallback() {
    super.connectedCallback();
    // const url = 'wss://k4330.uber.space';
    const url = 'ws://localhost:9000';
    this.connection = new WebSocket(url);

    this.connection.onopen = () => {
      console.log('socket opend');
      this.initSession();
    };

    this.connection.onmessage = (event) => {
      this.receive(event.data);
    };
  }

  receive(msg) {
    const data = JSON.parse(msg);
    // console.log('Recevied data', data);
    if (data.type === 'session-created') {
      window.location.hash = data.id;
    }
    if (data.type === 'session-broadcast') {
      this.setState({ peers: data.peers, session: data.session });
    }
    if (data.type === 'game-state') {
      this.setState({ ...data.state });
    }
  }

  initSession() {
    const sessionId = window.location.hash.split('#')[1];
    if (sessionId) {
      this.send({
        type: 'join-session',
        id: sessionId,
      });
    } else {
      this.send({ type: 'create-session' });
    }
  }

  send(data) {
    const message = JSON.stringify(data);
    // console.log(`Sending message ${message}`);
    this.connection.send(message);
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    if (this.state.isGameOver && this.state.correct / this.state.count === 1)
      myConfetti();
    // console.log('State ', this.state);
  }

  _handleClick(event, index) {
    this.send({
      type: 'answer',
      id: this.state.session,
      index,
    });
  }

  _handleReset(event) {
    this.send({
      type: 'reset',
      id: this.state.session,
    });
  }

  intro() {
    return html`
      <div class="overlay">
        <div>
          <p>Waiting for player ... Your session:</p>
          <h1 class="opacity-1">${this.state.session}</h1>
        </div>
      </div>
    `;
  }

  countdown() {
    return html`
      <div class="overlay">
        <div>
          <p>Player has landed. Get Ready ...</p>
          <h1 class="opacity-1">${this.state.countdown}</h1>
        </div>
      </div>
    `;
  }

  outro() {
    return html`
      <div class="overlay">
        <div>
          <p>Your Result</p>
          <h1 class="opacity-1">
            ${floor((this.state.correct / this.state.count) * 100)}%<br />
          </h1>
          <button @click=${this._handleReset}>Start new Game</button>
        </div>
      </div>
    `;
  }

  render() {
    if (this.state.peers?.clients?.length <= 1) {
      return this.intro();
    }

    if (this.state.countdown > 0) {
      return this.countdown();
    }

    return html`
      ${confetti}
      <header>
        <p class="intro_">Guess the color!</p>
        <h1>
          HSL(<span class="opacity-1">${this.state.color?.[0]}</span>,
          <span class="opacity-1">${this.state.color?.[1]}</span>%,
          <span class="opacity-1">${this.state.color?.[2]}</span>%)
        </h1>
        <p>Round: ${this.state.correct + 1} / ${this.state.maxQuestions}</p>
        <span
          class="indicator"
          style="transform:scale(${this.state.correct / this.state.count},1)"
        ></span>
      </header>
      <div style="display:grid;grid-auto-flow:column">
        ${this.state.colors?.map(
          (color, index) => html`
            <span
              class="color"
              @click=${(event) => this._handleClick(event, index)}
              style="background-color: hsl(${color[0]},${color[1]}%,${color[2]}%)"
            ></span>
          `,
        )}
      </div>
      ${this.state.isGameOver ? this.outro() : ''}
    `;
  }
}

customElements.define('color-battle', ColorBattle);
