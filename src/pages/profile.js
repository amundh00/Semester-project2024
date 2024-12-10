// src/pages/profile.js
import { API_BASE } from '../api/constants.js';

export const profile = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const userName = localStorage.getItem('userName');
    const isLoggedIn = !!accessToken;

    const div = document.createElement('div');
    div.classList.add('p-4', 'max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');

    if (!isLoggedIn) {
        div.innerHTML = '<p class="text-red-500">You need to log in to view your profile.</p>';
        return div;
    }

    try {
        const apiUrl = `${API_BASE}/auction/profiles/${userName}`;
        const profileResponse = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Noroff-API-Key': import.meta.env.VITE_API_KEY
            }
        });

        if (!profileResponse.ok) {
            throw new Error('Failed to fetch user profile');
        }

        const profileData = await profileResponse.json();
        const profile = profileData.data; // Extract the profile data

        const avatarUrl = profile.avatar ? profile.avatar.url : 'placeholder-avatar.jpg';
        const bannerUrl = profile.banner ? profile.banner.url : 'placeholder-banner.jpg';
        const bio = profile.bio || 'No bio available';
        const credits = profile.credits || 0;
        const email = profile.email || 'No email available';
        const listingsCount = profile._count ? profile._count.listings : 0;
        const winsCount = profile._count ? profile._count.wins : 0;

        div.innerHTML = `
            <div class="relative">
                <img src="${bannerUrl}" alt="Banner" class="w-full h-48 object-cover rounded-md">
                <div class="absolute top-20 left-1/2 transform -translate-x-1/2">
                    <img src="${avatarUrl}" alt="Avatar" class="w-24 h-24 rounded-full border-4 border-white">
                </div>
            </div>
            <div class="mt-16 text-center">
                <h1 class="text-2xl font-bold">${userName}</h1>
                <p class="text-lg text-gray-700 mb-4">${credits} $</p>
                <button id="editProfileButton" class="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition">
                    Edit profile
                </button>
            </div>
            <div class="mt-8 text-center">
                <button id="activeListingsButton" class="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition">Active Listings</button>
                <button id="wonAuctionsButton" class="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition ml-2">Won Auctions</button>
            </div>
            <div class="mt-8">
                <h2 class="text-xl font-bold mb-4" id="listingsTitle">Active listings:</h2>
                <div id="listings" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"></div>
            </div>
        `;

        const listingsContainer = div.querySelector('#listings');
        const listingsTitle = div.querySelector('#listingsTitle');
        const activeListingsButton = div.querySelector('#activeListingsButton');
        const wonAuctionsButton = div.querySelector('#wonAuctionsButton');
        const editProfileButton = div.querySelector('#editProfileButton');

        const fetchListings = async () => {
            const listingsUrl = `${API_BASE}/auction/profiles/${userName}/listings?_bids=true`;
            const listingsResponse = await fetch(listingsUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Noroff-API-Key': import.meta.env.VITE_API_KEY
                }
            });

            if (!listingsResponse.ok) {
                throw new Error('Failed to fetch user listings');
            }

            const listingsData = await listingsResponse.json();
            return listingsData.data;
        };

        const fetchWonAuctions = async () => {
            const winsUrl = `${API_BASE}/auction/profiles/${userName}/wins?_bids=true`;
            const winsResponse = await fetch(winsUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Noroff-API-Key': import.meta.env.VITE_API_KEY
                }
            });

            if (!winsResponse.ok) {
                throw new Error('Failed to fetch won auctions');
            }

            const winsData = await winsResponse.json();
            return winsData.data;
        };

        const displayListings = (listings) => {
            listingsContainer.innerHTML = '';

            listings.forEach((listing) => {
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

        // Fetch and display active listings by default
        const activeListings = await fetchListings();
        displayListings(activeListings);

        activeListingsButton.addEventListener('click', async () => {
            listingsTitle.textContent = 'Active listings:';
            activeListingsButton.classList.add('bg-purple-500');
            activeListingsButton.classList.remove('bg-gray-500');
            wonAuctionsButton.classList.add('bg-gray-500');
            wonAuctionsButton.classList.remove('bg-purple-500');
            const activeListings = await fetchListings();
            displayListings(activeListings);
        });

        wonAuctionsButton.addEventListener('click', async () => {
            listingsTitle.textContent = 'Won auctions:';
            wonAuctionsButton.classList.add('bg-purple-500');
            wonAuctionsButton.classList.remove('bg-gray-500');
            activeListingsButton.classList.add('bg-gray-500');
            activeListingsButton.classList.remove('bg-purple-500');
            const wonAuctions = await fetchWonAuctions();
            displayListings(wonAuctions);
        });

        editProfileButton.addEventListener('click', () => {
            window.location.href = '/editProfile';
        });

    } catch (error) {
        console.error('Error fetching user profile or listings:', error);
        div.innerHTML = '<p class="text-red-500">Failed to load profile information or listings.</p>';
    }

    return div;
};