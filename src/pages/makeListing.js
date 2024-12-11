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
            <div id="mediaContainer">
                <label class="block text-sm font-medium text-gray-700">Media URLs:</label>
                <input type="url" name="media" class="media-input mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" placeholder="Paste image URL here">
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
    div.querySelector("#createListingForm").addEventListener("submit", async function(event) {
        event.preventDefault();

        const title = document.getElementById("title").value;
        const description = document.getElementById("description").value;
        const tags = document.getElementById("tags").value.split(',').map(tag => tag.trim());
        const mediaInputs = mediaContainer.querySelectorAll('.media-input');
        const media = Array.from(mediaInputs)
            .map(input => input.value.trim())
            .filter(url => url !== '') // Filter out empty fields
            .map(url => ({ url, alt: title }));
        const endsAt = new Date(document.getElementById("endsAt").value).toISOString();

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

            // Improved error handling
            if (!response.ok && response.status !== 201) {
                const errorText = await response.text();
                console.error('API Response Error:', errorText);
                throw new Error(`Failed to create listing: ${errorText}`);
            }

            const result = await response.json();
            console.log('API Response:', result);

            // Delay before redirect to ensure the API processes the data
            setTimeout(() => {
                window.location.href = `/`;
            }, 500);
        } catch (error) {
            console.error('Error creating listing:', error);
            alert(`Failed to create listing: ${error.message}`);
        }
    });

    return div;
};
