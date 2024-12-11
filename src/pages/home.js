// src/pages/home.js
import { API_AUCTION_LISTINGS } from '../api/constants.js';

export const home = () => {
    const div = document.createElement('div');
    div.classList.add('p-4');

    div.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="mb-4 flex items-center gap-4">
                <input type="text" id="searchInput" placeholder="Search auctions..." class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                <select id="sortSelect" class="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                    <option value="newest">Newest</option>
                    <option value="highestBid">Highest to Lowest Bid</option>
                    <option value="lowestBid">Lowest to Highest Bid</option>
                    <option value="endingSoon">Ending Soon</option>
                    <option value="notEndingSoon">Not Ending Soon</option>
                </select>
            </div>
            <div id="loading" class="flex justify-center items-center h-48">
                <div class="loader border-8 border-t-8 border-gray-200 rounded-full h-16 w-16 border-t-purple-500 animate-spin"></div>
            </div>
            <div id="listings" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 hidden"></div>
        </div>
    `;

    const searchInput = div.querySelector('#searchInput');
    const sortSelect = div.querySelector('#sortSelect');
    const listingsContainer = div.querySelector('#listings');
    const loadingContainer = div.querySelector('#loading');

    const accessToken = localStorage.getItem('accessToken');
    let currentSortOption = 'newest'; // Default sorting option
    let currentSearchTerm = ''; // Current search term
    let listings = []; // Store listings for sorting
    let searchTimeout; // Add this variable to fix the error

    const fetchListings = async (searchTerm = '', sortOption = 'newest') => {
        try {
            // Log the access token and search term
            console.log('Access Token:', accessToken);
            console.log('Search Term:', searchTerm);
    
            const baseUrl = searchTerm.trim()
                ? `${API_AUCTION_LISTINGS}/search`
                : API_AUCTION_LISTINGS;
    
            // Log the base URL before using it
            console.log('Base URL:', baseUrl);
    
            const url = new URL(baseUrl); // This is where the URL is constructed
            url.searchParams.set('_active', 'true');
            url.searchParams.set('_bids', 'true');
    
            if (searchTerm.trim()) {
                url.searchParams.set('q', searchTerm);
            }
    
            // Log the complete URL
            console.log('Constructed URL:', url.toString());
    
            const response = await fetch(url.toString(), {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });
    
            // Log the HTTP status and check if the response is okay
            console.log('Response Status:', response.status);
            if (!response.ok) {
                throw new Error(`Failed to fetch listings: ${response.statusText}`);
            }
    
            const responseData = await response.json();
            // Log the fetched data
            console.log('Response Data:', responseData);
    
            listings = responseData.data || responseData;
    
            sortListings(sortOption); // Sort and display listings
        } catch (error) {
            console.error('Error fetching listings:', error);
            loadingContainer.innerHTML = `<p class="text-red-500">Failed to load listings: ${error.message}</p>`;
        }
    };
    

    // Sort listings based on selected option
    const sortListings = (sortOption) => {
        if (!listings || listings.length === 0) return;

        if (sortOption === 'highestBid') {
            listings.sort((a, b) => {
                const highestBidA = a.bids?.length ? Math.max(...a.bids.map(bid => bid.amount)) : 0;
                const highestBidB = b.bids?.length ? Math.max(...b.bids.map(bid => bid.amount)) : 0;
                return highestBidB - highestBidA;
            });
        } else if (sortOption === 'lowestBid') {
            listings.sort((a, b) => {
                const lowestBidA = a.bids?.length ? Math.max(...a.bids.map(bid => bid.amount)) : 0;
                const lowestBidB = b.bids?.length ? Math.max(...b.bids.map(bid => bid.amount)) : 0;
                return lowestBidA - lowestBidB;
            });
        } else if (sortOption === 'endingSoon') {
            listings.sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt));
        } else if (sortOption === 'notEndingSoon') {
            listings.sort((a, b) => new Date(b.endsAt) - new Date(a.endsAt));
        } else {
            // Default: Newest (based on creation date)
            listings.sort((a, b) => new Date(b.created) - new Date(a.created));
        }

        displayListings(listings);
    };

    const displayListings = (listings) => {
        listingsContainer.classList.remove('hidden');
        loadingContainer.classList.add('hidden');

        // Clear previous listings
        listingsContainer.innerHTML = '';

        if (!listings || listings.length === 0) {
            listingsContainer.innerHTML = '<p class="text-center text-gray-500">No active listings found.</p>';
            return;
        }

        listings.forEach(listing => {
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
                    <h3 class="text-lg font-semibold truncate" style="max-width: 100%;" title="${listing.title}">${listing.title}</h3>
                    <p class="text-gray-600 mt-2">Highest bid: <span class="font-bold">${highestBid}</span></p>
                    <p class="text-gray-600 mt-2">Ends at: <span class="font-bold">${endsAt}</span></p>
                </div>
            `;

            listingDiv.addEventListener('click', () => {
                window.location.href = `/auctionDetails?id=${listing.id}`;
            });

            listingsContainer.appendChild(listingDiv);
        });
    };

    // Add event listener for search input
    searchInput.addEventListener('input', (e) => {
        currentSearchTerm = e.target.value.trim();
        clearTimeout(searchTimeout); // Use searchTimeout defined above
        searchTimeout = setTimeout(() => {
            fetchListings(currentSearchTerm, currentSortOption);
        }, 300);
    });

    // Add event listener for sort dropdown
    sortSelect.addEventListener('change', (e) => {
        currentSortOption = e.target.value;
        sortListings(currentSortOption); // Re-sort the current listings
    });

    // Initial fetch and display of listings
    fetchListings();

    return div;
};
