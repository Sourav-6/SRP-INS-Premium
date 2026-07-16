/**
 * Utility functions for the calculator application.
 */

/**
 * Formats a number as Indian Currency (INR)
 * @param {number} amount 
 * @returns {string} formatted currency string
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Shows a toast notification on the screen
 * @param {string} message 
 * @param {string} type - 'success', 'error', 'info'
 */
export function showNotification(message, type = 'info') {
    // Create container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2';
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    
    // Base classes based on our design system
    let bgColor = 'bg-gray-800';
    let icon = 'ℹ️';
    
    if (type === 'success') {
        bgColor = 'bg-success'; // assuming bg-success class exists or style directly
        toast.style.backgroundColor = 'var(--success)';
        icon = '✅';
    } else if (type === 'error') {
        toast.style.backgroundColor = 'var(--error)';
        icon = '⚠️';
    } else {
        toast.style.backgroundColor = 'var(--primary)';
    }

    toast.className = `text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transform transition-all duration-300 translate-y-full opacity-0`;
    
    toast.innerHTML = `
        <span class="text-xl">${icon}</span>
        <span class="font-medium">${message}</span>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-full', 'opacity-0');
    });

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 300); // Wait for animation to finish
    }, 3000);
}

/**
 * Copies text to the clipboard
 * @param {string} text 
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!', 'success');
    } catch (err) {
        console.error('Failed to copy: ', err);
        showNotification('Failed to copy text', 'error');
    }
}
