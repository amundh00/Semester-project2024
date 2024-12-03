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
            <div id="listings" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"></div>
        </div>
    `;

    const searchInput = div.querySelector('#searchInput');
    const listingsContainer = div.querySelector('#listings');

    // Fetch and display listings
    const fetchListings = async () => {
        try {
            const response = await fetch(API_AUCTION_LISTINGS);
            if (!response.ok) {
                throw new Error('Failed to fetch listings');
            }
            const { data: listings } = await response.json();
            displayListings(listings);
            return listings;
        } catch (error) {
            console.error('Error fetching listings:', error);
            return [];
        }
    };

    // Display listings
    const displayListings = (listings) => {
        if (!Array.isArray(listings)) {
            console.error('Listings is not an array:', listings); // Debugging: Log if listings is not an array
            return;
        }
        listingsContainer.innerHTML = '';
        listings.forEach(listing => {
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

            const imageUrl = listing.media && listing.media.length > 0 ? listing.media[0].url : 'default-image.jpg';
    
            listingDiv.innerHTML = `
                <div class="h-48 w-full overflow-hidden">
                    <img src="${imageUrl}" alt="${listing.title}" class="w-full h-full object-cover">
                </div>
                <div class="p-4 flex-grow">
                    <h2 class="text-lg font-semibold mb-2">${listing.title}</h2>
                    <p class="text-gray-600 mb-4">${listing.description || 'No description available'}</p>
                </div>
                <div class="p-4 flex justify-between items-center">
                    <button class="w-1/2 bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition bid-button" data-id="${listing.id}">
                        Bid on auction!
                    </button>
                    <span class="text-gray-600">Bids: ${listing._count ? listing._count.bids : 0}</span>
                </div>
            `;

            // Add event listener to the card
            listingDiv.addEventListener('click', (event) => {
                if (!event.target.classList.contains('bid-button')) {
                    redirectToAuctionDetails(listing.id);
                }
            });

            // Add event listener to the button
            listingDiv.querySelector('.bid-button').addEventListener('click', (event) => {
                event.stopPropagation();
                redirectToAuctionDetails(listing.id);
            });

            listingsContainer.appendChild(listingDiv);
        });
    };

    // Redirect to auction details page
    const redirectToAuctionDetails = (id) => {
        history.pushState(null, null, `/auctionDetails?id=${id}`);
        handleLocation();
    };

    // Filter listings based on search input
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredListings = listings.filter(listing => 
            listing.title.toLowerCase().includes(searchTerm) ||
            listing.description.toLowerCase().includes(searchTerm)
        );
        displayListings(filteredListings);
    });

    // Initial fetch of listings
    let listings = [];
    fetchListings().then(fetchedListings => {
        listings = fetchedListings;
        displayListings(listings);
    });

    return div;
};