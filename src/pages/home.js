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
            <div id="pagination" class="flex justify-center mt-4 items-center space-x-4"></div>
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
    const limit = 50; // Show 50 listings per page

    // Fetch and display listings
    const fetchListings = async () => {
        let page = 1;

        while (true) {
            try {
                const response = await fetch(`${API_AUCTION_LISTINGS}?page=${page}&limit=${limit}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch listings');
                }
                const { data: listings, meta } = await response.json();
                allListings = allListings.concat(listings);

                // Check if there are more pages to fetch
                if (!meta || !meta.nextPage) {
                    break;
                }
                page++;
            } catch (error) {
                console.error('Error fetching listings:', error);
                break;
            }
        }

        // Check the endsAt property for each listing to determine if it is active
        const activeListings = allListings.filter(listing => new Date(listing.endsAt) > new Date());

        const sortedListings = activeListings.sort((a, b) => new Date(b.created) - new Date(a.created));

        displayListings(sortedListings, currentPage);
        setupPagination(sortedListings);
        return sortedListings;
    };

    const displayListings = (listings, page) => {
        listingsContainer.innerHTML = '';
        listingsContainer.classList.remove('hidden');
        loadingContainer.classList.add('hidden');

        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedListings = listings.slice(start, end);

        paginatedListings.forEach(listing => {
            const listingDiv = document.createElement('div');
            listingDiv.classList.add(
                'border',
                'rounded-md',
                'shadow-md',
                'bg-white',
                'hover:shadow-lg',
                'transition',
                'transform',
                'hover:-translate-y-1',
                'cursor-pointer'
            );

            const imageUrl = listing.media && listing.media.length > 0 ? listing.media[0].url : null;

            const highestBid = listing.bids && listing.bids.length > 0 
                ? Math.max(...listing.bids.map((bid) => bid.amount)) 
                : 'No bids yet';
            const endsAt = new Date(listing.endsAt).toLocaleString();

            listingDiv.innerHTML = `
                <div class="h-48 overflow-hidden flex items-center justify-center bg-gray-200">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${listing.title}" class="w-full h-full object-cover">` : '<span class="text-black">No image</span>'}
                </div>
                <div class="p-4 text-center">
                    <h3 class="text-lg font-semibold">${listing.title}</h3>
                    <p class="text-gray-600 mt-2">Highest bid: <span class="font-bold">${highestBid}</span></p>
                    <p class="text-gray-600 mt-2">Ends at: <span class="font-bold">${endsAt}</span></p>
                </div>
            `;

            // Add click event listener to navigate to auction details
            listingDiv.addEventListener('click', () => {
                window.location.href = `/auctionDetails?id=${listing.id}`;
            });

            listingsContainer.appendChild(listingDiv);
        });
    };

    const setupPagination = (listings) => {
        paginationContainer.innerHTML = '';

        const totalPages = Math.ceil(listings.length / limit);

        const prevButton = document.createElement('button');
        prevButton.classList.add('px-4', 'py-2', 'bg-purple-500', 'text-white', 'rounded-md', 'hover:bg-purple-600', 'transition');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayListings(listings, currentPage);
                updatePageNumber();
            }
        });

        const nextButton = document.createElement('button');
        nextButton.classList.add('px-4', 'py-2', 'bg-purple-500', 'text-white', 'rounded-md', 'hover:bg-purple-600', 'transition');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayListings(listings, currentPage);
                updatePageNumber();
            }
        });

        const pageNumber = document.createElement('span');
        pageNumber.id = 'pageNumber';
        pageNumber.classList.add('text-lg', 'font-semibold');
        pageNumber.textContent = `Page ${currentPage} of ${totalPages}`;

        paginationContainer.appendChild(prevButton);
        paginationContainer.appendChild(pageNumber);
        paginationContainer.appendChild(nextButton);
    };

    const updatePageNumber = () => {
        const pageNumber = document.querySelector('#pageNumber');
        pageNumber.textContent = `Page ${currentPage} of ${totalPages}`;
    };

    // Initial fetch and display of listings
    fetchListings();

    return div;
};