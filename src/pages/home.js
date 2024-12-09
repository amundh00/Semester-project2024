// src/pages/home.js
import { API_AUCTION_LISTINGS } from '../api/constants.js';
import { handleLocation } from '../router/index.js';

export const home = () => {
    const div = document.createElement('div');
    div.classList.add('p-4');

    div.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="mb-4">
                <input type="text" id="searchInput" placeholder="Search auctions..." class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
            </div>
            <div id="loading" class="flex justify-center items-center h-48">
                <div class="loader border-8 border-t-8 border-gray-200 rounded-full h-16 w-16 border-t-purple-500 animate-spin"></div>
            </div>
            <div id="listings" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 hidden"></div>
            <div id="pagination" class="flex justify-center mt-4"></div>
        </div>
    `;

    const searchInput = div.querySelector('#searchInput');
    const listingsContainer = div.querySelector('#listings');
    const loadingContainer = div.querySelector('#loading');
    const paginationContainer = div.querySelector('#pagination');

    const accessToken = localStorage.getItem('accessToken');
    const isLoggedIn = !!accessToken;

    let allListings = [];
    let currentPage = 1;
    const limit = 50; // Vis 50 innlegg per side

    // Hent og vis oppføringer
    const fetchListings = async () => {
        let page = 1;

        while (true) {
            try {
                const response = await fetch(`${API_AUCTION_LISTINGS}?page=${page}&limit=${limit}`);
                if (!response.ok) {
                    throw new Error('Klarte ikke å hente oppføringer');
                }
                const { data: listings, meta } = await response.json();
                allListings = allListings.concat(listings);

                // Sjekk om det er flere sider å hente
                if (!meta || !meta.nextPage) {
                    break;
                }
                page++;
            } catch (error) {
                console.error('Feil ved henting av oppføringer:', error);
                break;
            }
        }

        // Sjekk endsAt-eiendommen for hver oppføring for å bestemme om den er aktiv
        const activeListings = allListings.filter(listing => new Date(listing.endsAt) > new Date());

        const sortedListings = activeListings.sort((a, b) => new Date(b.created) - new Date(a.created));

        displayListings(sortedListings, currentPage);
        setupPagination(sortedListings);
        return sortedListings;
    };

    // Vis oppføringer
    const displayListings = (listings, page) => {
        if (!Array.isArray(listings)) {
            console.error('Oppføringer er ikke en array:', listings);
            return;
        }
        listingsContainer.innerHTML = '';
        const start = (page - 1) * limit;
        const end = page * limit;
        const paginatedListings = listings.slice(start, end);

        paginatedListings.forEach(listing => {
            const listingDiv = document.createElement('div');
            listingDiv.classList.add(
                'border', 
                'rounded-md', 
                'shadow-md', 
                'overflow-hidden', 
                'bg-white', 
                'hover:shadow-lg', 
                'transition', 
                'transform', 
                'hover:-translate-y-1',
                'flex', 
                'flex-col', 
                'justify-between',
                'cursor-pointer'
            );

            const imageUrl = listing.media && listing.media.length > 0 ? listing.media[0].url : 'placeholder-image.jpg';

            const endsAt = new Date(listing.endsAt).toLocaleString();
            const buttonText = isLoggedIn ? 'Bid on auction!' : 'Login to bid';
            const buttonAction = isLoggedIn ? 'bid-button' : 'login-button';
    
            listingDiv.innerHTML = `
                <div class="h-48 w-full overflow-hidden">
                    <img src="${imageUrl}" alt="${listing.title}" class="w-full h-full object-cover">
                </div>
                <div class="p-4 flex-grow">
                    <h2 class="text-lg font-semibold mb-2">${listing.title}</h2>
                    <p class="text-gray-600 mb-4">${listing.description || 'No description available'}</p>
                    <p class="text-gray-600 mb-4">Ends at: ${endsAt}</p>
                </div>
                <div class="p-4 flex justify-between items-center">
                    <button class="w-1/2 bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition ${buttonAction}" data-id="${listing.id}">
                        ${buttonText}
                    </button>
                    <span class="text-gray-600">Bids: ${listing._count ? listing._count.bids : 0}</span>
                </div>
            `;

            // Legg til event listener til kortet
            listingDiv.addEventListener('click', (event) => {
                if (!event.target.classList.contains('bid-button') && !event.target.classList.contains('login-button')) {
                    redirectToAuctionDetails(listing.id);
                }
            });

            // Legg til event listener til knappen
            listingDiv.querySelector(`.${buttonAction}`).addEventListener('click', (event) => {
                event.stopPropagation();
                if (isLoggedIn) {
                    redirectToAuctionDetails(listing.id);
                } else {
                    window.location.href = '/login';
                }
            });

            listingsContainer.appendChild(listingDiv);
        });

        // Skjul lasting og vis oppføringer
        loadingContainer.classList.add('hidden');
        listingsContainer.classList.remove('hidden');
    };

    // Sett opp paginering
    const setupPagination = (listings) => {
        const totalPages = Math.ceil(listings.length / limit);
        paginationContainer.innerHTML = '';

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.classList.add('mx-1', 'px-3', 'py-1', 'border', 'rounded-md', 'hover:bg-purple-500', 'hover:text-white', 'transition');
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => {
                currentPage = i;
                displayListings(listings, currentPage);
            });
            paginationContainer.appendChild(pageButton);
        }
    };

    // Omdiriger til auksjonsdetaljer-siden
    const redirectToAuctionDetails = (id) => {
        history.pushState(null, null, `/auctionDetails?id=${id}`);
        handleLocation();
    };

    // Initial henting av oppføringer
    fetchListings().then(fetchedListings => {
        // Filtrer oppføringer basert på søkeinput
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredListings = fetchedListings.filter(listing => 
                (listing.title && listing.title.toLowerCase().includes(searchTerm)) ||
                (listing.description && listing.description.toLowerCase().includes(searchTerm))
            );
            displayListings(filteredListings, 1);
            setupPagination(filteredListings);
        });
    });

    return div;
};