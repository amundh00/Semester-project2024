// Import page components
import { home } from '../pages/home.js';
import { login } from '../pages/login.js';
import { profile } from '../pages/profile.js';
import { register } from '../pages/register.js';
import { auctionDetails } from '../pages/auctionDetails.js';
import { makeListing } from '../pages/makeListing.js';
import { editProfile } from '../pages/editProfile.js';
import { editListing } from '../pages/editListing.js';

// Define routes
const routes = {
    '/': home,
    '/login': login,
    '/profile': profile,
    '/register': register,
    '/auctionDetails': auctionDetails,
    '/makeListing': makeListing,
    '/editProfile': editProfile,
    '/editListing': editListing,
    '/auctions': () => console.log('Auctions page'), // Placeholder route
};

// Handle location change and load the corresponding page
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
    appContent.appendChild(await page(params)); // Pass query params to the page
};

// Initialize the router
export const initRouter = () => {
    // Handle click events on links with data-link attribute
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-link]'); // Handle nested clickable elements
        if (link) {
            e.preventDefault();
            const href = link.getAttribute('href');
            history.pushState(null, null, href);
            handleLocation();
        }
    });

    // Handle browser back/forward navigation
    window.addEventListener('popstate', handleLocation);

    // Load the initial route
    handleLocation();
};
