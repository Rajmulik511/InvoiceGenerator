# Invoice Generator Web App 🧾

A modern, mobile-friendly invoice generator web application built with HTML, CSS, and JavaScript. Create professional invoices with automatic calculations, GST support, and PDF generation - all running in your browser!

## 🌟 Features

- **Mobile-First Design**: Fully responsive layout that works perfectly on all devices
- **Dynamic Item Management**: Add unlimited items with real-time calculations
- **Automatic Calculations**: 
  - Subtotal for each item
  - GST calculation with multiple tax rates (0%, 5%, 12%, 18%, 28%)
  - Grand total with tax breakdown
- **PDF Generation**: Download invoices as PDF with automatic filename generation
- **Live Preview**: See your invoice update in real-time as you type
- **No Dependencies**: Works completely offline after initial load
- **Professional Design**: Clean, modern interface with gradient themes

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended)
1. Fork this repository
2. Go to Settings → Pages
3. Select source branch (usually `main`)
4. Your app will be available at: `https://yourusername.github.io/invoice-system`

### Option 2: Local Development
1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Start creating invoices!

## 📱 How to Use

### Creating an Invoice

1. **Basic Information**
   - Enter bill number (e.g., INV-001)
   - Date is auto-set to today (can be changed)

2. **Customer Details**
   - Add customer name and address
   - See live preview update automatically

3. **Adding Items**
   - Enter item name, quantity, and price per unit
   - Select appropriate GST percentage
   - Click "Add Item" or press Enter
   - Items appear instantly in the preview table

4. **Generate PDF**
   - Click "Generate PDF" button
   - PDF automatically downloads with timestamp
   - Filename format: `Invoice_BILLNO_YYYYMMDD_HHMM.pdf`

5. **Reset Form**
   - Use "Reset Form" to clear all data and start fresh

### Features in Detail

- **Real-time Calculations**: All totals update automatically as you add items
- **Remove Items**: Click "Remove" button next to any item in the preview
- **Mobile Optimized**: Touch-friendly interface with proper zoom and scrolling
- **Offline Ready**: Works without internet after first load
- **Print Support**: Use browser print function for paper copies

## 🛠️ Technical Details

### Built With
- **HTML5**: Semantic markup for accessibility
- **CSS3**: Modern styling with Flexbox and Grid
- **Vanilla JavaScript**: No framework dependencies
- **jsPDF**: PDF generation library (loaded from CDN)

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

### File Structure
```
invoice-system/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
├── sw.js              # Service worker for offline support
└── README.md          # This file
```

## 🎨 Customization

### Change Company Information
Edit the header section in `index.html`:
```html
<h1>Your Business Name</h1>
<p>123 Business Street, City, State 12345</p>
<p>Phone: (555) 123-4567 | Email: info@yourbusiness.com</p>
```

### Modify Colors
The app uses CSS custom properties. Update the gradient colors in `styles.css`:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Add Your Logo
Replace the emoji logo (🏪) with your actual logo:
1. Add your logo image to the project folder
2. Update the logo sections in both HTML header and invoice preview

### GST Rates
Modify GST options in the select dropdown:
```html
<select id="gstPercentage">
    <option value="0">0%</option>
    <option value="5">5%</option>
    <!-- Add more rates as needed -->
</select>
```

## 📦 Deployment Options

### GitHub Pages
1. Create a new repository on GitHub
2. Upload all files to the repository
3. Enable GitHub Pages in repository settings
4. Your app will be live at `https://yourusername.github.io/repository-name`

### Netlify
1. Drag and drop the project folder to [Netlify](https://netlify.com)
2. Get an instant live URL

### Vercel
1. Connect your GitHub repository to [Vercel](https://vercel.com)
2. Automatic deployments on every commit

### Any Web Server
Simply upload all files to any web hosting service that supports static files.

## 🔧 Advanced Features

### Offline Support
The app includes a service worker that caches all files for offline use after the first load.

### Data Persistence
Currently, data is not saved between sessions. To add persistence:
1. Use `localStorage` to save invoice data
2. Add import/export functionality
3. Integrate with cloud storage APIs

### Additional PDF Features
The PDF generation can be enhanced with:
- Company logos
- Digital signatures
- Watermarks
- Multiple page support

## 🐛 Troubleshooting

### PDF Not Generating
- Ensure all required fields are filled
- Check browser console for errors
- Verify jsPDF library is loaded (check network tab)

### Mobile Display Issues
- Clear browser cache
- Ensure viewport meta tag is present
- Test in different mobile browsers

### Calculation Errors
- Verify numeric inputs are properly formatted
- Check GST percentage values
- Ensure quantity and price are positive numbers

## 📄 License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).

## 🤝 Contributing

Contributions are welcome! Please feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Open an issue on GitHub
3. Ensure you're using a supported browser

## 🌟 Show Your Support

If this project helped you, please ⭐ star the repository!

---

**Happy Invoicing!** 🎉
