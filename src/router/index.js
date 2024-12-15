import { home } from '../pages/home.js';
import { login } from '../pages/login.js';
import { profile } from '../pages/profile.js';
import { register } from '../pages/register.js';
import { auctionDetails } from '../pages/auctionDetails.js';
import { makeListing } from '../pages/makeListing.js';
import { editProfile } from '../pages/editProfile.js';
import { editListing } from '../pages/editListing.js';

// Definere ruter
const routes = {
    '/': home,
    '/login': login,
    '/profile': profile,
    '/register': register,
    '/auctionDetails': auctionDetails,
    '/makeListing': makeListing,
    '/editProfile': editProfile,
    '/editListing': editListing,
    '/auctions': () => console.log('Auctions page'),
};

// Håndtere lokasjon
export const handleLocation = async () => {
    const path = window.location.pathname;
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    const page = routes[path] || routes['/'];

    const appContent = document.querySelector('#app-content');
    if (!appContent) {
        console.error('Element with ID #app-content not found!');
        return;
    }

    appContent.innerHTML = '';
    appContent.appendChild(await page(params)); 
};

// Initialisere router
export const initRouter = () => {
    // Håndtere klik
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-link]'); // Finn nærmeste element med data-link attributt
        if (link) {
            e.preventDefault();
            const href = link.getAttribute('href');
            history.pushState(null, null, href);
            handleLocation();
        }
    });

    // Håndtere tilbake-knapp
    window.addEventListener('popstate', handleLocation);

    // Håndtere lokasjon
    handleLocation();
};
