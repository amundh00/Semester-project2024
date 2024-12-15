import { API_BASE } from '../api/constants.js';
import { handleLocation } from '../router/index.js';

export const editProfile = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const userName = localStorage.getItem('userName');
    const isLoggedIn = !!accessToken;

    if (!isLoggedIn) {
        alert('You need to log in to edit your profile.');
        return;
    }

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
    const profile = profileData.data;

    const div = document.createElement('div');
    div.classList.add('flex', 'items-center', 'justify-center', 'min-h-screen', 'bg-gray-100');

    div.innerHTML = `
        <div class="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full mt-20">
            <h1 class="text-center text-2xl font-semibold text-gray-800 mb-6">Edit Profile</h1>
            <form id="editProfileForm" class="space-y-4">
                <div>
                    <label for="avatarUrl" class="block text-sm font-medium text-gray-800">Avatar URL:</label>
                    <input 
                        type="url" 
                        id="avatarUrl" 
                        name="avatarUrl" 
                        class="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-700" 
                        value="${profile.avatar ? profile.avatar.url : ''}"
                        placeholder="Enter avatar image URL"
                    >
                </div>
                <div>
                    <label for="bannerUrl" class="block text-sm font-medium text-gray-800">Banner URL:</label>
                    <input 
                        type="url" 
                        id="bannerUrl" 
                        name="bannerUrl" 
                        class="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-700" 
                        value="${profile.banner ? profile.banner.url : ''}"
                        placeholder="Enter banner image URL"
                    >
                </div>
                <div>
                    <label for="bio" class="block text-sm font-medium text-gray-800">Bio:</label>
                    <textarea 
                        id="bio" 
                        name="bio" 
                        class="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-700"
                        placeholder="Write something about yourself">${profile.bio || ''}</textarea>
                </div>
                <div class="flex justify-between">
                    <button 
                        type="submit" 
                        class="py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                        Update Profile
                    </button>
                    <button 
                        type="button" 
                        id="cancelButton" 
                        class="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;

    // Håndering av form innsending
    div.querySelector("#editProfileForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        const avatarUrl = document.getElementById("avatarUrl").value;
        const bannerUrl = document.getElementById("bannerUrl").value;
        const bio = document.getElementById("bio").value;

        const updateData = {
            avatar: { url: avatarUrl },
            banner: { url: bannerUrl },
            bio
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Noroff-API-Key': import.meta.env.VITE_API_KEY
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            alert('Profile updated successfully!');
            history.pushState(null, null, '/profile');
            handleLocation();
        } catch (error) {
            alert('Failed to update profile. Please try again.');
        }
    });

    // kansellerknapp
    div.querySelector("#cancelButton").addEventListener("click", () => {
        history.pushState(null, null, '/profile');
        handleLocation();
    });

    return div;
};
