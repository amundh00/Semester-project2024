// src/pages/home.js
export const home = () => {
    const div = document.createElement('div');
    div.innerHTML = '<h1>Welcome to Auction App</h1>';
    return div;
};