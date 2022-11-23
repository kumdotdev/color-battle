import { css } from 'https://cdn.skypack.dev/lit?min';

export const myStyles = css`
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
    gap: 3rem;
    grid-template-columns: repeat(1, 1fr);
    grid-template-rows: 1fr 1fr;
    background-color: hsl(var(--hue), var(--saturation), 10%);
  }
  header {
    text-align: center;
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
    color: hsl(var(--hue), var(--saturation),  calc(var(--lightness) - 30%));
    border: 1px solid hsl(var(--hue), var(--saturation),  calc(var(--lightness) - 30%));
    text-transform: uppercase;
    letter-spacing: 0.2rem;
    font-sizex: 1rem;
    padding: 1rem 2rem;
    cursor: pointer;
    transition: 0.3s;
    margin-top: 3rem;
  }
  button:hover {
    background-color: hsla(
      var(--hue),
      var(--saturation),
      var(--lightness),
      5%
    );
  }
  canvas {
    display: block;
    position: fixed;
    z-index: 3;
    pointer-events: none;
    width: 100vw;
    height: 100vh
  }
`