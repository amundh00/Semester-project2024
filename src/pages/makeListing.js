import { API_BASE } from '../api/constants';

export const makeListing = () => {
    const div = document.createElement('div');
    div.classList.add('flex', 'items-center', 'justify-center', 'min-h-screen', 'bg-gray-100'); 

    div.innerHTML = `
        <div class="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full mt-20">
            <h1 class="text-center text-2xl font-semibold text-gray-800 mb-6">Create a New Listing</h1>
            <form id="createListingForm" class="space-y-4">
                <div>
                    <label for="title" class="block text-sm font-medium text-gray-800">Title:</label>
                    <input type="text" id="title" name="title" required class="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-700">
                </div>
                <div>
                    <label for="description" class="block text-sm font-medium text-gray-800">Description:</label>
                    <textarea id="description" name="description" class="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-700"></textarea>
                </div>
                <div id="mediaContainer">
                    <label class="block text-sm font-medium text-gray-800">Media URLs:</label>
                    <input type="url" name="media" class="media-input mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-700" placeholder="Paste image URL here">
                </div>
                <div>
                    <label for="endsAt" class="block text-sm font-medium text-gray-800">Ends At:</label>
                    <input type="datetime-local" id="endsAt" name="endsAt" required class="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-700">
                </div>
                <div>
                    <button type="submit" class="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                        Create Listing
                    </button>
                </div>
            </form>
        </div>
    `;

    const mediaContainer = div.querySelector('#mediaContainer');

    // Lytt etter når et eksisterende inputfelt blir fylt ut, og legg til et nytt inputfelt automatisk
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

    // Legg til event listener for innsending av skjema
    div.querySelector("#createListingForm").addEventListener("submit", async function(event) {
        event.preventDefault();

        const title = document.getElementById("title").value;
        const description = document.getElementById("description").value;
        const mediaInputs = mediaContainer.querySelectorAll('.media-input');
        const media = Array.from(mediaInputs)
            .map(input => input.value.trim())
            .filter(url => url !== '') // Filtrer ut tomme felt
            .map(url => ({ url, alt: title })); // Generer alt-tagger automatisk basert på tittelen
        const endsAt = new Date(document.getElementById("endsAt").value).toISOString();

        const listingData = {
            title,
            description,
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

            // Forbedret feilbehandling
            if (!response.ok && response.status !== 201) {
                const errorText = await response.text();
                //console.error('API-svar med feil:', errorText);
                throw new Error(`Kunne ikke opprette oppføring: ${errorText}`);
            }

            const result = await response.json();

            // Vent før omdirigering for å sikre at API-en behandler dataene
            setTimeout(() => {
                window.location.href = `/`;
            }, 500);
        } catch (error) {
            //console.error('Feil ved oppretting av oppføring:', error);
            alert(`Kunne ikke opprette oppføring: ${error.message}`);
        }
    });

    return div;
};
