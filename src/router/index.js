// Import page components
import { home } from '../pages/home.js';
import { login } from '../pages/login.js';
import { profile } from '../pages/profile.js';
import { register } from '../pages/register.js';
import { auctionDetails } from '../pages/auctionDetails.js';
import { makeListing } from '../pages/makeListing.js';
import { editProfile } from '../pages/editProfile.js';

// Define routes
const routes = {
    '/': home,
    '/login': login,
    '/profile': profile,
    '/register': register,
    '/auctionDetails': auctionDetails,
    '/makeListing': makeListing,
    '/editProfile': editProfile,
    '/auctions': () => console.log('Auctions page'), // Placeholder route
};

// Handle location change and load the corresponding page
export const handleLocation = async () => {
    const path = window.location.pathname.split('?')[0]; // Get the path without query parameters
    console.log('Navigating to path:', path);

    // Find the matching route, or fallback to home
    const page = routes[path] || routes['/'];

    // Clear the app content and load the new page
    const appContent = document.querySelector('#app-content');
    if (!appContent) {
        console.error('Element with ID #app-content not found!');
        return;
    }
    appContent.innerHTML = '';
    appContent.appendChild(await page());
};

// Initialize the router
export const initRouter = () => {
    // Handle click events on links with data-link attribute
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-link]')) {
            e.preventDefault();
            const href = e.target.getAttribute('href');
            history.pushState(null, null, href); // Update the browser's URL without reloading
            handleLocation(); // Handle navigation
        }
    });

    // Handle browser back/forward navigation
    window.addEventListener('popstate', handleLocation);

    // Load the initial route
    handleLocation();
};
