// src/pages/editListing.js
import { API_BASE } from '../api/constants.js';
import { handleLocation } from '../router/index.js'; // Import handleLocation from the router

export const editListing = async (params) => {
    const auctionId = params.get('id');
    const accessToken = localStorage.getItem('accessToken');

    const div = document.createElement('div');
    div.classList.add('p-4', 'max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');

    if (!auctionId) {
        div.innerHTML = '<p class="text-red-500">Auction ID not found.</p>';
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
        const tags = listing.tags || [];
        const media = listing.media || [];
        const endsAt = listing.endsAt ? new Date(listing.endsAt).toISOString().slice(0, 16) : '';

        div.innerHTML = `
            <h1 class="text-2xl font-bold mb-4">Edit Listing</h1>
            <form id="editListingForm" class="space-y-4">
                <div>
                    <label for="title" class="block text-sm font-medium text-gray-700">Title:</label>
                    <input type="text" id="title" name="title" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" value="${title}">
                </div>
                <div>
                    <label for="description" class="block text-sm font-medium text-gray-700">Description:</label>
                    <textarea id="description" name="description" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm">${description}</textarea>
                </div>
                <div>
                    <label for="tags" class="block text-sm font-medium text-gray-700">Tags (comma separated):</label>
                    <input type="text" id="tags" name="tags" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" value="${tags.join(', ')}">
                </div>
                <div id="mediaContainer">
                    <label class="block text-sm font-medium text-gray-700">Media URLs:</label>
                    ${media.map((m, index) => `
                        <input type="url" name="media" class="media-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" value="${m.url}" placeholder="Paste image URL here">
                    `).join('')}
                    <input type="url" name="media" class="media-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="Paste another image URL here">
                </div>
                <div>
                    <label for="endsAt" class="block text-sm font-medium text-gray-700">Ends At:</label>
                    <input type="datetime-local" id="endsAt" name="endsAt" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" value="${endsAt}">
                </div>
                <div class="flex justify-between">
                    <button type="submit" class="py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                        Update Listing
                    </button>
                    <button type="button" id="cancelButton" class="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                        Cancel
                    </button>
                    <button type="button" id="deleteButton" class="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        Delete Post
                    </button>
                </div>
            </form>
        `;

        const mediaContainer = div.querySelector('#mediaContainer');

        // Event listener to add new input field dynamically when an existing one is filled
        mediaContainer.addEventListener('input', (event) => {
            if (event.target.classList.contains('media-input') && event.target.value.trim() !== '') {
                const allMediaInputs = mediaContainer.querySelectorAll('.media-input');
                const lastInput = allMediaInputs[allMediaInputs.length - 1];

                if (lastInput === event.target) {
                    const newInput = document.createElement('input');
                    newInput.type = 'url';
                    newInput.name = 'media';
                    newInput.className = 'media-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm';
                    newInput.placeholder = 'Paste another image URL here';
                    mediaContainer.appendChild(newInput);
                }
            }
        });

        // Add event listener for form submission
        div.querySelector("#editListingForm").addEventListener("submit", async function(event) {
            event.preventDefault();

            const title = document.getElementById("title").value;
            const description = document.getElementById("description").value;
            const tags = document.getElementById("tags").value.split(',').map(tag => tag.trim());
            const mediaInputs = div.querySelectorAll('.media-input');
            const media = Array.from(mediaInputs)
                .map(input => input.value.trim())
                .filter(url => url !== '') // Filter out empty fields
                .map(url => ({ url, alt: title }));
            const endsAt = new Date(document.getElementById("endsAt").value).toISOString();

            const updateData = {
                title,
                description,
                tags,
                media,
                endsAt
            };

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
                console.error('Error updating listing:', error);
                alert('Failed to update listing. Please try again.');
            }
        });

        // Add event listener for cancel button
        div.querySelector("#cancelButton").addEventListener("click", () => {
            history.pushState(null, null, `/auctionDetails?id=${auctionId}`);
            handleLocation();
        });

        // Add event listener for delete button
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
                    console.error('Error deleting listing:', error);
                    alert('Failed to delete listing. Please try again.');
                }
            }
        });

    } catch (error) {
        console.error('Error fetching listing details:', error);
        div.innerHTML = '<p class="text-red-500">Failed to load listing details.</p>';
    }

    return div;
};