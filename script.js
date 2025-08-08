// Invoice Generator JavaScript
class InvoiceGenerator {
    constructor() {
        this.items = [];
        this.businessSettings = this.loadBusinessSettings();
        this.initializeEventListeners();
        this.setCurrentDate();
        this.updatePreview();
        this.applyBusinessSettings();
    }

    loadBusinessSettings() {
        const defaultSettings = {
            shopName: 'Satish Traders',
            shopLogo: '🏪',
            shopAddress: 'Moti Chowk Phaltan',
            shopContact: 'Phone: (555) 123-4567 | Email: info@satishtraders.com',
            shopGst: '27XXXXX1234X1Z5'
        };

        const saved = localStorage.getItem('businessSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }

    saveBusinessSettings() {
        localStorage.setItem('businessSettings', JSON.stringify(this.businessSettings));
    }

    initializeEventListeners() {
        // Add item button
        document.getElementById('addItemBtn').addEventListener('click', () => this.addItem());
        
        // Generate PDF button
        document.getElementById('generatePdfBtn').addEventListener('click', () => this.generatePDF());
        
        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => this.resetForm());

        // Settings modal listeners
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSettings());
        document.getElementById('closeSettings').addEventListener('click', () => this.closeSettings());
        document.getElementById('cancelSettings').addEventListener('click', () => this.closeSettings());
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
        document.getElementById('resetSettings').addEventListener('click', () => this.resetToDefault());
        
        // Close modal when clicking outside
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target.id === 'settingsModal') {
                this.closeSettings();
            }
        });
        
        // Form input listeners for live preview
        const inputs = ['billNumber', 'billDate', 'customerName', 'customerAddress'];
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.updatePreview());
        });

        // GST percentage change listener
        document.getElementById('finalGstPercentage').addEventListener('change', () => this.updatePreview());

        // Enter key handler for item form
        const itemInputs = ['itemName', 'quantity', 'pricePerUnit'];
        itemInputs.forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addItem();
                }
            });
        });
    }

    setCurrentDate() {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        document.getElementById('billDate').value = formattedDate;
    }

    addItem() {
        const itemName = document.getElementById('itemName').value.trim();
        const quantity = parseFloat(document.getElementById('quantity').value) || 0;
        const pricePerUnit = parseFloat(document.getElementById('pricePerUnit').value) || 0;

        // Validation
        if (!itemName) {
            this.showMessage('Please enter item name', 'error');
            return;
        }
        if (quantity <= 0) {
            this.showMessage('Please enter valid quantity', 'error');
            return;
        }
        if (pricePerUnit <= 0) {
            this.showMessage('Please enter valid price', 'error');
            return;
        }

        // Calculate total for this item (no GST at item level)
        const total = quantity * pricePerUnit;

        // Create item object
        const item = {
            id: Date.now(),
            name: itemName,
            quantity: quantity,
            pricePerUnit: pricePerUnit,
            total: total
        };

        // Add to items array
        this.items.push(item);

        // Clear form
        this.clearItemForm();

        // Update preview
        this.updatePreview();

        this.showMessage('Item added successfully!', 'success');
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.updatePreview();
        this.showMessage('Item removed successfully!', 'success');
    }

    clearItemForm() {
        document.getElementById('itemName').value = '';
        document.getElementById('quantity').value = '';
        document.getElementById('pricePerUnit').value = '';
        document.getElementById('itemName').focus();
    }

    updatePreview() {
        this.updateBasicInfo();
        this.updateItemsTable();
        this.updateTotals();
    }

    updateBasicInfo() {
        const billNumber = document.getElementById('billNumber').value || '-';
        const billDate = document.getElementById('billDate').value || '-';
        const customerName = document.getElementById('customerName').value || '-';
        const customerAddress = document.getElementById('customerAddress').value || '-';

        document.getElementById('previewBillNumber').textContent = billNumber;
        document.getElementById('previewDate').textContent = billDate ? this.formatDate(billDate) : '-';
        document.getElementById('previewCustomerName').textContent = customerName;
        document.getElementById('previewCustomerAddress').textContent = customerAddress;
    }

    updateItemsTable() {
        const tbody = document.getElementById('itemsTableBody');
        
        if (this.items.length === 0) {
            tbody.innerHTML = '<tr class="no-items"><td colspan="5">No items added yet</td></tr>';
            return;
        }

        tbody.innerHTML = this.items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>₹${item.pricePerUnit.toFixed(2)}</td>
                <td>₹${item.total.toFixed(2)}</td>
                <td>
                    <button class="btn btn-warning" onclick="invoiceApp.removeItem(${item.id})">
                        Remove
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateTotals() {
        const subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
        const gstPercentage = parseFloat(document.getElementById('finalGstPercentage').value) || 0;
        const gstAmount = (subtotal * gstPercentage) / 100;
        const grandTotal = subtotal + gstAmount;

        document.getElementById('subtotalAmount').textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById('totalGstAmount').textContent = `₹${gstAmount.toFixed(2)}`;
        document.getElementById('grandTotalAmount').textContent = `₹${grandTotal.toFixed(2)}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    async generatePDF() {
        // Validation
        const billNumber = document.getElementById('billNumber').value.trim();
        const customerName = document.getElementById('customerName').value.trim();

        if (!billNumber) {
            this.showMessage('Please enter bill number', 'error');
            return;
        }
        if (!customerName) {
            this.showMessage('Please enter customer name', 'error');
            return;
        }
        if (this.items.length === 0) {
            this.showMessage('Please add at least one item', 'error');
            return;
        }

        try {
            // Show loading
            const generateBtn = document.getElementById('generatePdfBtn');
            const originalText = generateBtn.innerHTML;
            generateBtn.innerHTML = '<span class="loading"></span> Generating...';
            generateBtn.disabled = true;

            // Initialize jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // PDF styling constants
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 15;
            const contentWidth = pageWidth - 2 * margin;
            let yPosition = 25;

            // Add black border around entire PDF
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(1.5);
            doc.rect(5, 5, pageWidth - 10, pageHeight - 10);

            // Company header section
            doc.setFontSize(20);
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, 'bold');
            doc.text(this.businessSettings.shopName, margin, yPosition);
            
            yPosition += 8;
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(60, 60, 60);
            
            // Split address into lines if it's too long
            const addressLines = doc.splitTextToSize(this.businessSettings.shopAddress, 120);
            doc.text(addressLines, margin, yPosition);
            yPosition += addressLines.length * 4;
            
            doc.text(this.businessSettings.shopContact, margin, yPosition);
            yPosition += 4;
            doc.text(`GST No: ${this.businessSettings.shopGst}`, margin, yPosition);

            // Invoice title and bill info (right side)
            doc.setFontSize(18);
            doc.setTextColor(0, 0, 0);
            doc.setFont(undefined, 'bold');
            doc.text('INVOICE', pageWidth - margin - 35, 25);

            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            doc.text(`Bill No: ${billNumber}`, pageWidth - margin - 60, 35);
            doc.text(`Date: ${this.formatDate(document.getElementById('billDate').value)}`, pageWidth - margin - 60, 42);

            // Horizontal line after header
            yPosition += 10;
            doc.setLineWidth(0.5);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);

            // Customer info
            yPosition += 10;
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text('Bill To:', margin, yPosition);
            
            yPosition += 6;
            doc.setFont(undefined, 'normal');
            doc.text(customerName, margin, yPosition);
            
            const customerAddress = document.getElementById('customerAddress').value;
            if (customerAddress) {
                const addressLines = doc.splitTextToSize(customerAddress, 100);
                yPosition += 4;
                doc.text(addressLines, margin, yPosition);
                yPosition += addressLines.length * 4;
            }

            // Items table with fixed structure
            yPosition += 15;
            const tableStartY = yPosition;
            const tableHeaders = ['S.No.', 'Item Description', 'Qty', 'Rate', 'Amount'];
            const columnWidths = [20, 67, 20, 40, 40]; // Reduced Qty width, increased Rate and Amount
            const rowHeight = 8;
            const maxRows = 14; // Fixed number of rows

            // Table header
            doc.setFillColor(240, 240, 240);
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.5);
            doc.rect(margin, yPosition, contentWidth, rowHeight, 'FD');
            
            doc.setFontSize(9);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(0, 0, 0);
            
            let xPosition = margin;
            tableHeaders.forEach((header, index) => {
                // Center align all headers
                const headerX = xPosition + columnWidths[index] / 2;
                doc.text(header, headerX, yPosition + 5, { align: 'center' });
                if (index < tableHeaders.length - 1) {
                    doc.line(xPosition + columnWidths[index], yPosition, xPosition + columnWidths[index], yPosition + rowHeight);
                }
                xPosition += columnWidths[index];
            });

            yPosition += rowHeight;

            // Table rows (fixed structure)
            doc.setFont(undefined, 'normal');
            doc.setFontSize(8);
            
            for (let i = 0; i < maxRows; i++) {
                const isDataRow = i < this.items.length;
                
                // Draw row border
                doc.rect(margin, yPosition, contentWidth, rowHeight);
                
                if (isDataRow) {
                    const item = this.items[i];
                    const rowData = [
                        (i + 1).toString(),
                        item.name,
                        item.quantity.toString(),
                        `Rs.${item.pricePerUnit.toFixed(2)}`,
                        `Rs.${item.total.toFixed(2)}`
                    ];
                    
                    xPosition = margin;
                    rowData.forEach((cell, index) => {
                        let textX, textAlign;
                        
                        if (index === 0) {
                            // S.No - center aligned
                            textX = xPosition + columnWidths[index] / 2;
                            textAlign = 'center';
                        } else if (index === 1) {
                            // Item Description - left aligned with padding
                            textX = xPosition + 2;
                            textAlign = 'left';
                        } else {
                            // Qty, Rate, Amount - center aligned
                            textX = xPosition + columnWidths[index] / 2;
                            textAlign = 'center';
                        }
                        
                        // Truncate long text if needed
                        let displayText = cell;
                        if (index === 1 && doc.getTextWidth(cell) > columnWidths[index] - 4) {
                            displayText = doc.splitTextToSize(cell, columnWidths[index] - 4)[0];
                            if (displayText.length < cell.length) {
                                displayText = displayText.substring(0, displayText.length - 3) + '...';
                            }
                        }
                        
                        if (textAlign === 'center') {
                            doc.text(displayText, textX, yPosition + 5, { align: 'center' });
                        } else {
                            doc.text(displayText, textX, yPosition + 5);
                        }
                        
                        // Draw vertical lines
                        if (index < columnWidths.length - 1) {
                            doc.line(xPosition + columnWidths[index], yPosition, xPosition + columnWidths[index], yPosition + rowHeight);
                        }
                        xPosition += columnWidths[index];
                    });
                } else {
                    // Empty row - just draw vertical lines
                    xPosition = margin;
                    for (let j = 0; j < columnWidths.length - 1; j++) {
                        xPosition += columnWidths[j];
                        doc.line(xPosition, yPosition, xPosition, yPosition + rowHeight);
                    }
                }
                
                yPosition += rowHeight;
            }

            // Totals section
            yPosition += 5;
            const totals = this.calculateTotals();
            const gstPercentage = parseFloat(document.getElementById('finalGstPercentage').value) || 0;
            
            // Totals box
            const totalsBoxWidth = 100;
            const totalsBoxHeight = 30;
            const totalsX = pageWidth - margin - totalsBoxWidth;
            
            doc.setLineWidth(0.8);
            doc.rect(totalsX, yPosition, totalsBoxWidth, totalsBoxHeight);
            
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            
            // Subtotal
            doc.text('Subtotal:', totalsX + 3, yPosition + 7);
            doc.text(`Rs.${totals.subtotal.toFixed(2)}`, totalsX + totalsBoxWidth / 2 + 15, yPosition + 7);
            
            // GST
            doc.text(`GST (${gstPercentage}%):`, totalsX + 3, yPosition + 14);
            doc.text(`Rs.${totals.gstAmount.toFixed(2)}`, totalsX + totalsBoxWidth / 2 + 15, yPosition + 14);
            
            // Line before grand total
            doc.line(totalsX + 3, yPosition + 18, totalsX + totalsBoxWidth - 3, yPosition + 18);
            
            // Grand Total
            doc.setFont(undefined, 'bold');
            doc.setFontSize(10);
            doc.text('Grand Total:', totalsX + 3, yPosition + 25);
            doc.text(`Rs.${totals.grandTotal.toFixed(2)}`, totalsX + totalsBoxWidth / 2 + 15, yPosition + 25);

            // Signature section (left side of totals box)
            const signatureY = yPosition + 40;
            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            
            // Signature line and text
            doc.text('Signature:', margin, signatureY);
            doc.line(margin + 25, signatureY - 2, margin + 62, signatureY - 2); // Signature line (reduced to half)
            
            // Shop name below signature
            doc.setFont(undefined, 'bold');
            doc.text(this.businessSettings.shopName, margin + 25, signatureY + 10);

            // Footer
            const footerY = pageHeight - 25;
            doc.setFontSize(8);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text('Thank you for your business!', margin, footerY);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth - margin - 80, footerY);

            // Generate filename with current date and time
            const now = new Date();
            const filename = `Invoice_${billNumber}_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.pdf`;

            // Save the PDF
            doc.save(filename);

            this.showMessage('PDF generated successfully!', 'success');

        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showMessage('Error generating PDF. Please try again.', 'error');
        } finally {
            // Reset button
            const generateBtn = document.getElementById('generatePdfBtn');
            generateBtn.innerHTML = 'Generate PDF';
            generateBtn.disabled = false;
        }
    }

    calculateTotals() {
        const subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
        const gstPercentage = parseFloat(document.getElementById('finalGstPercentage').value) || 0;
        const gstAmount = (subtotal * gstPercentage) / 100;
        const grandTotal = subtotal + gstAmount;
        
        return { subtotal, gstAmount, grandTotal };
    }

    resetForm() {
        if (confirm('Are you sure you want to reset the form? This will clear all data.')) {
            // Clear all form fields
            document.getElementById('billNumber').value = '';
            document.getElementById('customerName').value = '';
            document.getElementById('customerAddress').value = '';
            
            // Reset GST to default
            document.getElementById('finalGstPercentage').value = '18';
            
            // Reset date to current date
            this.setCurrentDate();
            
            // Clear items
            this.items = [];
            
            // Clear item form
            this.clearItemForm();
            
            // Update preview
            this.updatePreview();
            
            this.showMessage('Form reset successfully!', 'success');
        }
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;
        messageDiv.style.display = 'block';

        // Insert after form section
        const formSection = document.querySelector('.form-section');
        formSection.parentNode.insertBefore(messageDiv, formSection.nextSibling);

        // Auto remove after 3 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    applyBusinessSettings() {
        // Update header
        document.getElementById('headerLogo').textContent = this.businessSettings.shopLogo;
        document.getElementById('headerCompanyName').textContent = this.businessSettings.shopName;
        document.getElementById('headerAddress').textContent = this.businessSettings.shopAddress;
        document.getElementById('headerContact').textContent = this.businessSettings.shopContact;
        document.getElementById('headerGst').textContent = `GST No: ${this.businessSettings.shopGst}`;

        // Update invoice preview
        document.getElementById('previewLogo').textContent = this.businessSettings.shopLogo;
        document.getElementById('previewCompanyName').textContent = this.businessSettings.shopName;
        document.getElementById('previewAddress').textContent = this.businessSettings.shopAddress;
        document.getElementById('previewContact').textContent = this.businessSettings.shopContact.split('|')[0].trim(); // Only phone for preview
        document.getElementById('previewGst').textContent = `GST No: ${this.businessSettings.shopGst}`;
    }

    openSettings() {
        // Populate form with current settings
        document.getElementById('shopName').value = this.businessSettings.shopName;
        document.getElementById('shopLogo').value = this.businessSettings.shopLogo;
        document.getElementById('shopAddress').value = this.businessSettings.shopAddress;
        document.getElementById('shopContact').value = this.businessSettings.shopContact;
        document.getElementById('shopGst').value = this.businessSettings.shopGst;

        // Show modal
        document.getElementById('settingsModal').style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    closeSettings() {
        document.getElementById('settingsModal').style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }

    saveSettings() {
        // Get form values
        const newSettings = {
            shopName: document.getElementById('shopName').value.trim(),
            shopLogo: document.getElementById('shopLogo').value.trim() || '🏪',
            shopAddress: document.getElementById('shopAddress').value.trim(),
            shopContact: document.getElementById('shopContact').value.trim(),
            shopGst: document.getElementById('shopGst').value.trim()
        };

        // Validation
        if (!newSettings.shopName) {
            this.showMessage('Shop name is required', 'error');
            return;
        }
        if (!newSettings.shopAddress) {
            this.showMessage('Shop address is required', 'error');
            return;
        }
        if (!newSettings.shopContact) {
            this.showMessage('Contact information is required', 'error');
            return;
        }

        // Update settings
        this.businessSettings = newSettings;
        this.saveBusinessSettings();
        this.applyBusinessSettings();
        this.closeSettings();
        
        this.showMessage('Business settings updated successfully!', 'success');
    }

    resetToDefault() {
        if (confirm('Are you sure you want to reset to default business settings?')) {
            const defaultSettings = {
                shopName: 'Satish Traders',
                shopLogo: '🏪',
                shopAddress: 'Moti Chowk Phaltan',
                shopContact: 'Phone: (555) 123-4567 | Email: info@satishtraders.com',
                shopGst: '27XXXXX1234X1Z5'
            };

            this.businessSettings = defaultSettings;
            this.saveBusinessSettings();
            this.applyBusinessSettings();
            
            // Update form fields
            document.getElementById('shopName').value = defaultSettings.shopName;
            document.getElementById('shopLogo').value = defaultSettings.shopLogo;
            document.getElementById('shopAddress').value = defaultSettings.shopAddress;
            document.getElementById('shopContact').value = defaultSettings.shopContact;
            document.getElementById('shopGst').value = defaultSettings.shopGst;

            this.showMessage('Settings reset to default values!', 'success');
        }
    }

    // ...existing code...
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.invoiceApp = new InvoiceGenerator();
});

// Service Worker Registration for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registered successfully');
            })
            .catch(registrationError => {
                console.log('ServiceWorker registration failed');
            });
    });
}
