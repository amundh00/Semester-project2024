// src/app.js
import { renderHeader } from './components/navBar.js';
import { initRouter } from './router/index.js';

// Setup app structure
document.getElementById('app').innerHTML = `
    <div id="header"></div>
    <main id="app-content"></main>
`;

// Render header
document.getElementById('header').appendChild(renderHeader());

// Initialize router
initRouter();