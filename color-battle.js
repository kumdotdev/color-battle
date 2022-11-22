import { css, html, LitElement } from 'https://cdn.skypack.dev/lit?min';
import canvasConfetti from 'https://cdn.skypack.dev/canvas-confetti';

const { random, floor } = Math;

const confetti = document.createElement('canvas');
const myConfetti = canvasConfetti.create(confetti, { resize: true });

class ColorBattle extends LitElement {
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
    console.log('Recevied data', data);
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
    console.log(`Sending message ${message}`);
    this.connection.send(message);
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    console.log('State: ', this.state);
  }

  _handleClick(event) {
    this.send({type: 'answer', id: this.state.session, color: event.target.getAttribute('data-color')});
  }

  render() {
    if (this.state.peers?.clients?.length <= 1) {
      return html`<h2>Your session is: ${this.state.session} Waiting for player ...</h2>`;
    }
    return html`
      <style>
        :host {
          --hue: 220;
          --saturation: 10%;
          --lightness: 80%;
          font-family: system-ui, sans-serif;
          color: hsl(
            var(--hue),
            var(--saturation),
            calc(var(--lightness) - 30%)
          );
          min-height: 100vh;
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: auto 1fr;
          background-color: hsl(var(--hue), var(--saturation), 10%);
        }
        header {
          text-align: center;
          grid-column: 1 / span 3;
          justify-self: center;
          padding-top: 1rem;
        }
        h1 {
          margin: 0.2em 0 0.3em;
          line-height: 1;
          font-weight: 700;
          font-size: 7vw;
          color: hsl(
            var(--hue),
            var(--saturation),
            calc(var(--lightness) - 50%)
          );
        }
        .intro {
          font-size: 1.2rem;
          margin: 0.3em 0;
          text-transform: uppercase;
          letter-spacing: 0.3rem;
        }
        .opacity-1 {
          color: hsl(var(--hue), var(--saturation), var(--lightness));
        }
        .color {
          cursor: pointer;
          transition: transform 0.1s ease-in-out;
          transform: scale(0.95);
          border: 1px solid
            hsl(var(--hue), var(--saturation), calc(var(--lightness) / 2));
        }
        .color:hover {
          transform: scale(1);
        }
        .indicator {
          position: fixed;
          top: 0;
          left: 0;
          height: 4px;
          width: 100vw;
          transition: transform 0.6s ease-out;
          transform-origin: left;
          background-color: hsl(
            var(--hue),
            var(--saturation),
            var(--lightness)
          );
          transform: scale(0, 1);
          z-index: 2;
        }
        .overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: hsla(var(--hue), var(--saturation), 10%, 94%);
          display: grid;
          place-items: center;
          text-align: center;
        }
        .overlay > div {
          padding-bottom: 10vh;
        }
        button {
          background-color: transparent;
          color: hsl(var(--hue), var(--saturation), var(--lightness));
          border: 1px solid hsl(var(--hue), var(--saturation), var(--lightness));
          text-transform: uppercase;
          letter-spacing: 0.2rem;
          font-size: 1rem;
          padding: 1rem 2rem;
          cursor: pointer;
          transition: 0.3s;
        }
        button:hover {
          background-color: hsla(
            var(--hue),
            var(--saturation),
            var(--lightness),
            15%
          );
        }
        canvas {
          display: block;
          position: fixed;
          z-index: 3;
          pointer-events: none;
        }
      </style>
      ${confetti}
      <header>
        <p class="introxxx">
          Guess the color! Clients:
          ${this.state.peers?.clients?.map((client) => html`${client} `)}
        </p>
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
      ${this.state.colors?.map(
        (color) => html`
          <span
            class="color"
            data-color=${color}
            @click=${this._handleClick}
            style="background-color: hsl(${color[0]},${color[1]}%,${color[2]}%)"
          ></span>
        `
      )}
      ${this.state.isGameOver
        ? html`
            <div class="overlay">
              <div>
                <p class="intro">Your Result</p>
                <h1 class="opacity-1">
                  ${floor((this.state.correct / this.state.count) * 100)}%<br />
                </h1>
                <button @click=${this.reset}>Start new Game</button>
              </div>
            </div>
          `
        : ''}
    `;
  }
}

customElements.define('color-battle', ColorBattle);
