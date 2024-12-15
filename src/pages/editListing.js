import { API_BASE } from '../api/constants.js';
import { handleLocation } from '../router/index.js'; // importer handleLocation-funksjonen fra router/index.js

export const editListing = async (params) => {
    const auctionId = params.get('id');
    const accessToken = localStorage.getItem('accessToken');

    const div = document.createElement('div');
    div.classList.add('flex', 'items-center', 'justify-center', 'min-h-screen', 'bg-gray-100'); 

    if (!auctionId) {
        div.innerHTML = `
            <div class="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full mt-20">
                <p class="text-red-500">Auction ID not found.</p>
            </div>
        `;
        return div;
    }

    try {
        const response = await fetch(`${API_BASE}/auction/listings/${auctionId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Noroff-API-Key': import.meta.env.VITE_API_KEY
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch listing details');
        }

        const { data: listing } = await response.json();

        const title = listing.title || '';
        const description = listing.description || '';
        const media = listing.media || [];

        div.innerHTML = `
            <div class="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full mt-20">
                <h1 class="text-center text-2xl font-semibold text-gray-800 mb-6">Edit Listing</h1>
                <form id="editListingForm" class="space-y-4">
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-800">Title:</label>
                        <input type="text" id="title" name="title" required class="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-700" value="${title}">
                    </div>
                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-800">Description:</label>
                        <textarea id="description" name="description" class="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-700">${description}</textarea>
                    </div>
                    <div id="mediaContainer">
                        <label class="block text-sm font-medium text-gray-800">Media URLs:</label>
                        ${media.map((m, index) => `
                            <input type="url" name="media" class="media-input mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-700" value="${m.url}" placeholder="Paste image URL here">
                        `).join('')}
                        <input type="url" name="media" class="media-input mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-700" placeholder="Paste another image URL here">
                    </div>
                    <div class="flex justify-end space-x-2 mt-4">
                    <button 
                        type="submit" 
                        class="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                        Update Listing
                    </button>
                    <button 
                        type="button" 
                        id="cancelButton" 
                        class="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        id="deleteButton" 
                        class="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        Delete Post
                    </button>
                </div>
                </form>
            </div>
        `;

        const mediaContainer = div.querySelector('#mediaContainer');

        // Event listener for å legge til flere inputfelt for media
        mediaContainer.addEventListener('input', (event) => {
            if (event.target.classList.contains('media-input') && event.target.value.trim() !== '') {
                const allMediaInputs = mediaContainer.querySelectorAll('.media-input');
                const lastInput = allMediaInputs[allMediaInputs.length - 1];

                if (lastInput === event.target) {
                    const newInput = document.createElement('input');
                    newInput.type = 'url';
                    newInput.name = 'media';
                    newInput.className = 'media-input mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-700';
                    newInput.placeholder = 'Paste another image URL here';
                    mediaContainer.appendChild(newInput);
                }
            }
        });

        // form innsending funksjonalitet
        div.querySelector("#editListingForm").addEventListener("submit", async function(event) {
            event.preventDefault();

            const title = document.getElementById("title").value;
            const description = document.getElementById("description").value;
            const mediaInputs = div.querySelectorAll('.media-input');
            const media = Array.from(mediaInputs)
                .map(input => input.value.trim())
                .filter(url => url !== '')
                .map(url => ({ url, alt: title }));

            const updateData = { title, description, media };

            try {
                const response = await fetch(`${API_BASE}/auction/listings/${auctionId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-Noroff-API-Key': import.meta.env.VITE_API_KEY
                    },
                    body: JSON.stringify(updateData)
                });

                if (!response.ok) {
                    throw new Error('Failed to update listing');
                }

                alert('Listing updated successfully!');
                history.pushState(null, null, `/`);
                handleLocation();
            } catch (error) {
                alert('Failed to update listing. Please try again.');
            }
        });

        // Avbryt-knapp funksjonalitet
        div.querySelector("#cancelButton").addEventListener("click", () => {
            history.pushState(null, null, `/auctionDetails?id=${auctionId}`);
            handleLocation();
        });

        // Slette-knapp funksjonalitet
        div.querySelector("#deleteButton").addEventListener("click", async () => {
            const confirmed = confirm('Are you sure you want to delete this post?');
            if (confirmed) {
                try {
                    const response = await fetch(`${API_BASE}/auction/listings/${auctionId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                            'X-Noroff-API-Key': import.meta.env.VITE_API_KEY
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to delete listing');
                    }

                    alert('Listing deleted successfully!');
                    history.pushState(null, null, `/`);
                    handleLocation();
                } catch (error) {
                    alert('Failed to delete listing. Please try again.');
                }
            }
        });

    } catch (error) {
        div.innerHTML = `
            <div class="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full mt-20">
                <p class="text-red-500">Failed to load listing details.</p>
            </div>
        `;
    }

    return div;
};
