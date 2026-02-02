# 🍕 DeliveryOS - Complete Food Delivery Management System

> A full-stack, production-ready food delivery management system built with React, PHP, and MySQL. Perfect for restaurants, dark kitchens, food chains, and delivery startups.

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/deliveryos)
[![License](https://img.shields.io/badge/license-Regular-green.svg)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-7.4%2B-777BB4.svg)](https://php.net)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org)

---

## ✨ Key Features

### 🎯 Complete Management System
- **Multi-role Dashboard**: Separate interfaces for Customers, Admins, and Drivers
- **Real-time Order Tracking**: WebSocket-powered live updates and notifications
- **Smart Delivery Zones**: Geographic zones with customizable delivery pricing
- **Payment Integration**: Stripe + Cash on delivery options
- **Email Notifications**: Professional transactional emails via SendGrid
- **Mobile Responsive**: Works perfectly on phones, tablets, and desktops

### 👥 Customer Features
✅ Browse menu by categories  
✅ Real-time shopping cart  
✅ Multiple delivery addresses  
✅ Order history and live tracking  
✅ Secure payment processing  
✅ Email confirmations  

### 👨‍💼 Admin Features  
✅ Complete dashboard with analytics  
✅ Product & category management  
✅ Order management system  
✅ Driver assignment  
✅ Delivery zone configuration  
✅ Revenue reports  

### 🚚 Driver Features
✅ View assigned deliveries  
✅ Update delivery status  
✅ Navigation integration  
✅ Delivery history  
✅ Real-time notifications  

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite 7.3, TailwindCSS 3 |
| **Backend** | PHP 7.4+/8.x, RESTful API |
| **Database** | MySQL 5.7+/8.x |
| **Authentication** | JWT (JSON Web Tokens) |
| **Payments** | Stripe API |
| **Emails** | SendGrid API |
| **Real-time** | Socket.IO (Node.js) |
| **Routing** | React Router 6 |

---

## 📋 System Requirements

- **Web Server**: Apache 2.4+ with `mod_rewrite` enabled
- **PHP**: 7.4 or higher (**PHP 8.x recommended**)
- **MySQL**: 5.7+ or MySQL 8.x
- **Node.js**: 16+ (for WebSocket and build process)
- **Composer**: Latest version
- **npm/yarn**: Latest version

**Recommended Server:**
- 2 CPU cores
- 4GB RAM
- 20GB storage
- Ubuntu 20.04 LTS or similar

---

## 🚀 Quick Installation

### Step 1: Create Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE deliverysv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'deliverysv_user'@'localhost' IDENTIFIED BY 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON deliverysv.* TO 'deliverysv_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 2: Import Database Schema

```bash
cd /path/to/deliveryos
mysql -u deliverysv_user -p deliverysv < backend/database/schema.sql
mysql -u deliverysv_user -p deliverysv < backend/database/seeds.sql
```

### Step 3: Configure Backend

```bash
cd backend
composer install
cp .env.example .env
nano .env  # Edit with your settings
```

**Required `.env` settings:**
```env
DB_HOST=localhost
DB_NAME=deliverysv
DB_USER=deliverysv_user
DB_PASS=YourSecurePassword123!

JWT_SECRET=change-this-to-random-64-character-string
STRIPE_SECRET_KEY=sk_test_your_stripe_key
SENDGRID_API_KEY=SG.your_sendgrid_api_key
```

### Step 4: Configure & Build Frontend

```bash
cd frontend
npm install
cp .env.example .env
nano .env  # Edit with your API URL
npm run build
```

### Step 5: Start WebSocket Server

```bash
cd backend
node websocket-server.js &

# Or use PM2 for production:
npm install -g pm2
pm2 start websocket-server.js --name deliveryos-ws
pm2 save
```

### Step 6: Access the Application

Open your browser: `http://localhost` or `http://yourdomain.com`

**Default login credentials:**
- **Admin**: `admin@deliveryos.com` / `Admin123!@#`
- **Driver**: `driver@deliveryos.com` / `Driver123!@#`
- **Customer**: `customer@deliveryos.com` / `Customer123!@#`

🔐 **Change these in production!**

---

## 📁 Project Structure

```
deliveryos/
│
├── backend/
│   ├── api/                      # REST API endpoints
│   │   ├── auth/                # Login, register, validate
│   │   ├── products/            # CRUD products
│   │   ├── categories/          # CRUD categories
│   │   ├── orders/              # Order management
│   │   ├── payments/            # Stripe integration
│   │   ├── delivery-zones/      # Delivery zones
│   │   └── users/               # User management
│   ├── config/                   # Configuration files
│   │   ├── Database.php         # PDO connection
│   │   └── Env.php              # .env loader
│   ├── middleware/               # Middleware classes
│   │   ├── Auth.php             # JWT verification
│   │   └── RateLimit.php        # Rate limiting
│   ├── services/                 # Service classes
│   │   ├── EmailService.php     # SendGrid emails
│   │   └── JWTService.php       # JWT handling
│   ├── database/                 # SQL files
│   │   ├── schema.sql           # Database structure
│   │   └── seeds.sql            # Sample data
│   ├── uploads/                  # User uploads
│   │   └── products/            # Product images
│   ├── logs/                     # Error logs
│   ├── websocket-server.js       # Socket.IO server
│   ├── .env.example             # Environment template
│   ├── .htaccess                # Apache configuration
│   └── composer.json            # PHP dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── ProductCard.jsx
│   │   │   ├── CartItem.jsx
│   │   │   └── NotificationBell.jsx
│   │   ├── pages/               # Page components
│   │   │   ├── Menu.jsx         # Customer menu
│   │   │   ├── Checkout.jsx     # Checkout page
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── DriverOrders.jsx
│   │   ├── services/            # API services
│   │   │   ├── api.js           # Axios instance
│   │   │   ├── authService.js
│   │   │   └── orderService.js
│   │   ├── context/             # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── App.jsx              # Main app component
│   │   └── main.jsx             # Entry point
│   ├── public/                   # Static files
│   ├── dist/                     # Production build
│   ├── .env.example             # Frontend env template
│   ├── package.json             # Node dependencies
│   ├── vite.config.js           # Vite configuration
│   └── tailwind.config.js       # Tailwind CSS config
│
├── docs/                         # Documentation
│   ├── API.md                   # API documentation
│   ├── DEPLOYMENT.md            # Deployment guide
│   └── CUSTOMIZATION.md         # Customization guide
│
├── test-api.sh                   # Automated API tests
├── TESTING_CHECKLIST.md          # Manual testing guide
├── README.md                     # This file
├── LICENSE                       # License file
└── CHANGELOG.md                  # Version history
```

---

## 🔒 Security Features

Our system implements industry-standard security practices:

- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Password Hashing**: bcrypt with salt
- ✅ **SQL Injection Protection**: Prepared statements
- ✅ **XSS Prevention**: Input sanitization
- ✅ **CSRF Protection**: Token validation
- ✅ **Rate Limiting**: Prevent brute force
- ✅ **Secure Headers**: HSTS, CSP, etc.
- ✅ **Environment Variables**: No hardcoded secrets
- ✅ **HTTPS Ready**: SSL/TLS support
- ✅ **Input Validation**: Server-side validation

---

## 💳 Payment Integration

### Stripe Setup

1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from Dashboard
3. Add to `.env`:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Test Cards

For testing payments (Stripe Test Mode):

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 9995 | Decline |
| 4000 0025 0000 3155 | 3D Secure |

More: https://stripe.com/docs/testing

---

## 📧 Email Configuration

### SendGrid Setup

1. Create account at [sendgrid.com](https://sendgrid.com)
2. Verify sender email
3. Create API key
4. Add to `.env`:
```env
SENDGRID_API_KEY=SG.xxx
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=YourRestaurant
```

### Email Templates Included

- ✅ Order confirmation (customer)
- ✅ New order alert (admin)
- ✅ Order assigned (driver)
- ✅ Status updates
- ✅ Welcome email
- ✅ Password reset

---

## 🧪 Testing

### Automated API Testing

Run the included test script:

```bash
bash test-api.sh
```

This tests:
- ✅ Authentication endpoints
- ✅ Product APIs
- ✅ Order creation
- ✅ Payment intent
- ✅ Image uploads

### Manual Testing

See `TESTING_CHECKLIST.md` for complete manual testing guide (150+ test cases).

---

## 🚢 Deployment Guide

### Option 1: Shared Hosting (cPanel)

1. Upload files via FTP to `public_html/`
2. Import database via phpMyAdmin
3. Configure `.env` files
4. Build frontend: `npm run build`
5. Set file permissions: `chmod 755/777`

### Option 2: VPS/Cloud Server

**Recommended providers:**
- DigitalOcean ($12/mo)
- Linode ($10/mo)
- Vultr ($10/mo)
- AWS Lightsail ($10/mo)

**Setup steps:**
```bash
# Install LAMP stack
sudo apt update
sudo apt install apache2 mysql-server php8.1 php8.1-mysql

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Enable Apache modules
sudo a2enmod rewrite
sudo systemctl restart apache2

# Clone/upload your files
# Follow installation steps above

# Configure Apache virtual host
# Enable SSL with Let's Encrypt
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d yourdomain.com

# Set up PM2 for WebSocket
sudo npm install -g pm2
pm2 start backend/websocket-server.js
pm2 startup
pm2 save
```

### Option 3: Docker (Coming Soon)

Docker Compose configuration in development.

---

## 🎨 Customization

### Change Branding

**Logo and Colors:**
1. Replace `/frontend/src/assets/logo.png`
2. Edit `/frontend/src/index.css` for colors
3. Modify `/frontend/tailwind.config.js` for theme

**Restaurant Info:**
1. Edit `.env` files
2. Update email templates in `/backend/services/EmailService.php`

### Add Products

1. Login as admin
2. Navigate to "Categories" → Add categories
3. Navigate to "Products" → Add products
4. Upload product images (stored locally in `/backend/uploads/products/`)

### Configure Delivery Zones

1. Login as admin
2. Go to "Delivery Zones"
3. Add zones with:
   - Zone name
   - Delivery fee
   - Estimated time
   - Geographic boundaries

---

## 🐛 Common Issues & Solutions

### 1. Frontend shows 404 errors

**Solution:**
- Enable Apache `mod_rewrite`: `sudo a2enmod rewrite`
- Check `.htaccess` exists in frontend folder
- Restart Apache: `sudo systemctl restart apache2`

### 2. API returns CORS errors

**Solution:**
- Check CORS headers in `/backend/api/.htaccess`
- Verify `VITE_API_URL` in frontend `.env`
- Clear browser cache

### 3. Database connection fails

**Solution:**
- Verify MySQL is running: `sudo systemctl status mysql`
- Check credentials in `/backend/.env`
- Test connection: `mysql -u deliverysv_user -p`

### 4. Stripe payments fail

**Solution:**
- Use test mode keys for development
- Check Stripe dashboard for errors
- Verify webhook endpoint (if using webhooks)
- Use test cards from Stripe docs

### 5. Emails not sending

**Solution:**
- Verify SendGrid API key is valid
- Check sender email is verified in SendGrid
- Review SendGrid activity log
- Check `/backend/logs/` for errors

### 6. WebSocket connection fails

**Solution:**
- Check Node.js server is running: `pm2 list`
- Verify port 3001 is open: `sudo ufw allow 3001`
- Check `VITE_WEBSOCKET_URL` in frontend `.env`
- Review browser console for connection errors

---

## 📊 Performance Optimization

### Frontend
- ✅ Code splitting with React lazy loading
- ✅ Image optimization
- ✅ Gzip compression
- ✅ CDN-ready static assets
- ✅ Service Worker (optional)

### Backend
- ✅ Database indexing
- ✅ Query optimization
- ✅ Response caching
- ✅ Rate limiting
- ✅ Opcode caching (OPcache)

### Database
```sql
-- Add indexes for better performance
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_products_category ON products(category_id);
```

---

## 📄 License

**Regular License** - Single End Product

✅ **You CAN:**
- Use for one client/project
- Modify the code
- Use commercially

❌ **You CANNOT:**
- Resell or redistribute
- Use for multiple clients
- Create SaaS platform

For **Extended License** (multiple clients, SaaS), contact us.

---

## 🤝 Support & Updates

### Getting Help

- 📖 **Documentation**: Check `/docs/` folder
- 📧 **Email**: support@yourdomain.com
- 💬 **Response Time**: 24-48 hours
- 🎯 **Priority Support**: Available for Extended License

### Updates

- ✅ Bug fixes: Free lifetime
- ✅ Security patches: Free lifetime
- ⚠️ Major versions: May require additional license

---

## 📝 Changelog

### Version 1.0.0 (January 2026)
- 🎉 Initial release
- ✅ Complete order management
- ✅ Stripe payment integration
- ✅ Real-time WebSocket notifications
- ✅ SendGrid email system
- ✅ JWT authentication
- ✅ Multi-role system
- ✅ Responsive design
- ✅ Local image storage
- ✅ Rate limiting
- ✅ Comprehensive documentation

---

## 🗺️ Roadmap

### Version 1.1 (Coming Soon)
- [ ] Multi-language support (i18n)
- [ ] Dark mode
- [ ] Advanced analytics dashboard
- [ ] Customer loyalty program
- [ ] Discount/coupon system
- [ ] SMS notifications (Twilio)

### Version 2.0 (Future)
- [ ] Mobile apps (React Native)
- [ ] Multi-restaurant support
- [ ] Kitchen Display System (KDS)
- [ ] Inventory management
- [ ] Table reservations
- [ ] QR code ordering

---

## 🙏 Credits

- **UI Framework**: [TailwindCSS](https://tailwindcss.com)
- **Icons**: [Heroicons](https://heroicons.com)
- **Payments**: [Stripe](https://stripe.com)
- **Emails**: [SendGrid](https://sendgrid.com)
- **Real-time**: [Socket.IO](https://socket.io)

---

## 📞 Contact

- **Website**: https://yourdomain.com
- **Email**: contact@yourdomain.com
- **Support**: support@yourdomain.com
- **Documentation**: https://docs.yourdomain.com

---

<div align="center">

**Made with ❤️ for the food delivery industry**

⭐ **Rate us on CodeCanyon if you love this product!** ⭐

[Buy Now](https://codecanyon.net) | [Live Demo](https://demo.deliveryos.com) | [Documentation](https://docs.deliveryos.com)

</div>
