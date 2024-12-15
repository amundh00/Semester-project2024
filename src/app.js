import { renderHeader } from './components/navBar.js';
import { initRouter } from './router/index.js';

// sett opp HTML-struktur
document.getElementById('app').innerHTML = `
    <div id="header"></div>
    <main id="app-content"></main>
`;

// Render header
document.getElementById('header').appendChild(renderHeader());

// initialiser router
initRouter();