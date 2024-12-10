// src/pages/editProfile.js
import { API_BASE } from '../api/constants.js';

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
    const profile = profileData.data; // Extract the profile data

    const avatarUrl = profile.avatar ? profile.avatar.url : '';
    const bannerUrl = profile.banner ? profile.banner.url : '';
    const bio = profile.bio || '';

    const div = document.createElement('div');
    div.classList.add('p-4', 'max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');
    div.innerHTML = `
        <div class="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 class="text-xl font-bold mb-4">Update Profile</h2>
            <form id="updateProfileForm" class="space-y-4">
                <div>
                    <label for="bio" class="block text-sm font-medium text-gray-800">Bio:</label>
                    <textarea id="bio" name="bio" class="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-700">${bio}</textarea>
                </div>
                <div>
                    <label for="avatarUrl" class="block text-sm font-medium text-gray-800">Avatar URL:</label>
                    <input type="url" id="avatarUrl" name="avatarUrl" class="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-700" value="${avatarUrl}">
                </div>
                <div>
                    <label for="bannerUrl" class="block text-sm font-medium text-gray-800">Banner URL:</label>
                    <input type="url" id="bannerUrl" name="bannerUrl" class="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-gray-700" value="${bannerUrl}">
                </div>
                <div>
                    <button type="submit" class="w-full py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                        Update Profile
                    </button>
                    <button type="button" id="cancelUpdate" class="w-full mt-2 py-2 px-4 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(div);

    const updateProfileForm = div.querySelector('#updateProfileForm');
    const cancelUpdateButton = div.querySelector('#cancelUpdate');

    updateProfileForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const bio = document.getElementById('bio').value;
        const avatarUrl = document.getElementById('avatarUrl').value;
        const bannerUrl = document.getElementById('bannerUrl').value;

        const updateData = {
            bio,
            avatar: { url: avatarUrl, alt: '' },
            banner: { url: bannerUrl, alt: '' }
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
            window.location.reload();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    });

    cancelUpdateButton.addEventListener('click', () => {
        div.remove();
    });
};