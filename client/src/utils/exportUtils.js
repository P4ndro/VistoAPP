import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Helper function to wait for images to load
const waitForImages = (element, timeout = 15000) => {
    return new Promise((resolve) => {
        const images = element.querySelectorAll('img');
        if (images.length === 0) {
            resolve();
            return;
        }

        let loadedCount = 0;
        const totalImages = images.length;
        let timeoutId;
        let resolved = false;

        const checkComplete = () => {
            if (resolved) return;
            loadedCount++;
            if (loadedCount === totalImages) {
                resolved = true;
                clearTimeout(timeoutId);
                resolve();
            }
        };

        images.forEach((img) => {
            if (img.complete) {
                checkComplete();
            } else {
                img.onload = checkComplete;
                img.onerror = checkComplete; // Count errors as "loaded" to avoid hanging
            }
        });

        // If all images were already loaded, resolve immediately
        if (loadedCount === totalImages) {
            resolve();
            return;
        }

        timeoutId = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                console.warn('Image loading timeout reached');
                resolve(); // Resolve anyway to proceed
            }
        }, timeout);
    });
};


const exportToPNG = async (element, filename = 'portfolio.png') => {
    if (!element) {
        throw new Error('Element is required for PNG export');
    }

    try {
        // Wait for images to load
        await waitForImages(element);

        const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2, // Higher quality
            useCORS: true, // Allow cross-origin images
            allowTaint: false,
            logging: false,
            imageTimeout: 15000,
        });

        if (!canvas) {
            throw new Error('Failed to generate canvas');
        }

        const image = canvas.toDataURL('image/png');
        if (!image || image === 'data:,') {
            throw new Error('Failed to convert canvas to image');
        }

        const link = document.createElement('a');
        link.href = image;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        // Clean up after a short delay
        setTimeout(() => {
            document.body.removeChild(link);
        }, 100);
        
        return image;
    } catch (error) {
        console.error('Export PNG error details:', error);
        throw new Error(`PNG export failed: ${error.message}`);
    }
};

const exportToPDF = async (element, filename = 'portfolio.pdf') => {
    if (!element) {
        throw new Error('Element is required for PDF export');
    }

    try {
        // Wait for images to load
        await waitForImages(element);

        const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 3, // Higher quality for PDF (3x scale for better resolution)
            useCORS: true, // Allow cross-origin images
            allowTaint: false,
            logging: false,
            imageTimeout: 15000,
        });

        if (!canvas) {
            throw new Error('Failed to generate canvas');
        }

        const imgData = canvas.toDataURL('image/png', 1.0); // Maximum quality
        if (!imgData || imgData === 'data:,') {
            throw new Error('Failed to convert canvas to image');
        }

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Convert canvas pixels to mm for PDF
        // At 96 DPI: 1 inch = 25.4mm = 96px, so 1px = 25.4/96 mm
        const pxToMM = 25.4 / 96;
        const imgWidthMM = imgWidth * pxToMM;
        const imgHeightMM = imgHeight * pxToMM;

        // Create PDF with custom dimensions matching the content exactly (no white edges)
        const pdf = new jsPDF({
            orientation: imgWidthMM > imgHeightMM ? 'landscape' : 'portrait',
            unit: 'mm',
            format: [imgWidthMM, imgHeightMM], // Custom size matching content
            compress: true,
        });

        // Add image to fill entire page (0,0 offset, exact dimensions)
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidthMM, imgHeightMM, undefined, 'FAST');
        
        pdf.save(filename);
        
        return pdf;
    } catch (error) {
        console.error('Export PDF error details:', error);
        throw new Error(`PDF export failed: ${error.message}`);
    }
};

export { exportToPNG, exportToPDF };