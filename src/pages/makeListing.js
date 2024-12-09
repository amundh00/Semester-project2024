import { API_BASE } from '../api/constants';

export const makeListing = () => {
    const div = document.createElement('div');
    div.classList.add('p-4', 'max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');
    div.innerHTML = `
        <h1 class="text-2xl font-bold mb-4">Create a New Listing</h1>
        <form id="createListingForm" class="space-y-4">
            <div>
                <label for="title" class="block text-sm font-medium text-gray-700">Title:</label>
                <input type="text" id="title" name="title" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm">
            </div>
            <div>
                <label for="description" class="block text-sm font-medium text-gray-700">Description:</label>
                <textarea id="description" name="description" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"></textarea>
            </div>
            <div>
                <label for="tags" class="block text-sm font-medium text-gray-700">Tags (comma separated):</label>
                <input type="text" id="tags" name="tags" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm">
            </div>
            <div>
                <label for="media" class="block text-sm font-medium text-gray-700">Media URL:</label>
                <input type="url" id="media" name="media" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm">
            </div>
            <div>
                <label for="endsAt" class="block text-sm font-medium text-gray-700">Ends At:</label>
                <input type="datetime-local" id="endsAt" name="endsAt" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm">
            </div>
            <div>
                <button type="submit" class="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                    Create Listing
                </button>
            </div>
        </form>
    `;

    // Add event listener for form submission
    div.querySelector("#createListingForm").addEventListener("submit", async function(event) {
        event.preventDefault();

        const title = document.getElementById("title").value;
        const description = document.getElementById("description").value;
        const tags = document.getElementById("tags").value.split(',').map(tag => tag.trim());
        const mediaUrl = document.getElementById("media").value;
        const endsAt = new Date(document.getElementById("endsAt").value).toISOString();

        const media = mediaUrl ? [{ url: mediaUrl, alt: title }] : [];

        const listingData = {
            title,
            description,
            tags,
            media,
            endsAt
        };

        try {
            const accessToken = localStorage.getItem('accessToken');
            const API_KEY = import.meta.env.VITE_API_KEY;

            const response = await fetch(`${API_BASE}/auction/listings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Noroff-API-Key': API_KEY
                },
                body: JSON.stringify(listingData)
            });

            if (!response.ok) {
                throw new Error('Failed to create listing');
            }

            const result = await response.json();
            console.log('Listing created successfully:', result);

            // Redirect to the newly created listing's details page or another page
            window.location.href = `/auctionDetails?id=${result.data.id}`;
        } catch (error) {
            console.error('Error creating listing:', error);
            alert('Failed to create listing. Please try again.');
        }
    });

    return div;
};