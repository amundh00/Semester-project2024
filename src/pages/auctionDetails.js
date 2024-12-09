// src/pages/auctionDetails.js
import { API_AUCTION_LISTING } from '../api/constants.js';

export const auctionDetails = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const auctionId = urlParams.get('id');

    const div = document.createElement('div');
    div.classList.add('p-4', 'max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');

    if (!auctionId) {
        div.innerHTML = '<p class="text-red-500">Auction ID not found.</p>';
        return div;
    }

    try {
        const response = await fetch(`${API_AUCTION_LISTING}/${auctionId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch auction details');
        }
        const { data: auction } = await response.json();
        console.log('Fetched auction details:', auction); // Debugging: Log the fetched auction details

        const title = auction.title || 'No title available';
        const imageUrl = auction.media && auction.media.length > 0 ? auction.media[0].url : 'default-image.jpg';
        const description = auction.description || 'No description available';
        const bidsCount = auction._count && auction._count.bids ? auction._count.bids : 0;

        div.innerHTML = `
            <div class="bg-white p-8 rounded-lg shadow-lg">
                <h1 class="text-2xl font-semibold mb-4">${title}</h1>
                <div class="h-64 w-full overflow-hidden mb-4">
                    <img src="${imageUrl}" alt="${title}" class="w-full h-full object-cover">
                </div>
                <p class="text-gray-600 mb-4">${description}</p>
                <p class="text-gray-600 mb-4">Bids: ${bidsCount}</p>
                <button class="bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition">Place a Bid</button>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching auction details:', error);
        div.innerHTML = '<p class="text-red-500">Failed to load auction details.</p>';
    }

    return div;
};