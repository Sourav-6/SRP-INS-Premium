import { showNotification } from './utils.js';

/**
 * Triggers the browser print dialog
 */
export function printQuote() {
    window.print();
}

/**
 * Generates and downloads a PDF of the quote summary.
 * Uses html2canvas and jsPDF (assumes they are loaded via CDN).
 */
export async function downloadPDF() {
    const summaryCard = document.getElementById('premium-summary-card');
    if (!summaryCard) {
        showNotification('Cannot find summary card to download.', 'error');
        return;
    }

    // Show loading notification
    showNotification('Generating PDF...', 'info');
    
    try {
        // Temporarily adjust styles for better PDF rendering
        const originalStyle = summaryCard.style.cssText;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        summaryCard.style.padding = '24px';
        summaryCard.style.backgroundColor = isDark ? '#121212' : '#f5f7fa';
        summaryCard.style.color = 'var(--text)';
        
        // Ensure html2canvas and jspdf are available
        if (typeof window.html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
            throw new Error('PDF libraries are not loaded. Please ensure internet connection.');
        }

        const { jsPDF } = window.jspdf;

        // Render to canvas
        const canvas = await html2canvas(summaryCard, {
            scale: 2, // Higher quality
            useCORS: true,
            logging: false,
            backgroundColor: isDark ? '#121212' : '#f5f7fa'
        });

        // Restore styles immediately
        summaryCard.style.cssText = originalStyle;

        // Calculate dimensions (Standard PDF width 210mm, height scaled proportionally)
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = 210;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        // Create PDF with custom height matching content exactly
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [pdfWidth, pdfHeight]
        });

        // Add image to PDF
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        // Save
        pdf.save('Premium-Quote.pdf');
        showNotification('PDF downloaded successfully!', 'success');

    } catch (error) {
        console.error('PDF Generation Error:', error);
        showNotification('Error generating PDF.', 'error');
    }
}
