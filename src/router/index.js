// src/router/index.js
import { home } from '../pages/home.js';
import { login } from '../pages/login.js';
import { profile } from '../pages/profile.js';
import { register } from '../pages/register.js';
import { auctionDetails } from '../pages/auctionDetails.js';

const routes = {
    '/': home,
    '/auctions': () => console.log('auctions page'),
    '/profile': profile,
    '/login': login,
    '/register': register,
    '/auctionDetails': auctionDetails
};

export const handleLocation = async () => {
    const path = window.location.pathname.split('?')[0];
    const page = routes[path] || routes['/'];
    document.querySelector('#app-content').innerHTML = '';
    document.querySelector('#app-content').appendChild(await page());
};

export const initRouter = () => {
    // Handle navigation
    document.addEventListener('click', e => {
        if (e.target.matches('[data-link]')) {
            e.preventDefault();
            history.pushState(null, null, e.target.href);
            handleLocation();
        }
    });

    // Handle browser back/forward
    window.addEventListener('popstate', handleLocation);

    // Handle initial load
    handleLocation();
};