# ChauffeurLux

ChauffeurLux is a digital-first e-commerce platform for premium chauffeur and luxury car rental services based in Cape Town, South Africa. This project delivers a seamless online booking experience, a secure payment system and comprehensive vehicle catalogue to serve the high-end tourism, corporate and special event markets. Built with a focus on efficiency and a superior user experience, this website is the core of the ChauffeurLux business model.
## Features
- **User Authentication**: A secure system that allows users to register, login and manage their personal profiles
- **Admin Dashboard**: A private portal for the ChauffeurLux team that allows efficient management of all pending and confirmed bookings.
- **Booking and Payment System**: A streamlined process integrated with a secure payment gateway and automatically sends a booking notification/confirmation email to the user.
- **Vehicle Catalogue**: A digital catalogue showcasing the exclusive fleet of luxury vehicles.
- **Customer Reviews**: Customers can submit feedback and ratings after their service.
- **Responsive Design**: The website is fully responsive for both desktop and mobile devices.
## Technologies Used
- **React.js**
- **Node.js**
- **MySQL**
- **JavaScript**
- **HTML & CSS**
- **JWT** (JSON Web Token)
- **Stripe**
- **Nodemailer**
## Installation
**Prerequisites**
- **Node.js**: Ensure you have Node.js and npm installed.
- **MySQL Workbench**: Ensure you have MySQL and a local instance of MySQL Workbench installed to manage the databse.
1. **Clone the repository**
   ```bash
   git clone https://github.com/kouthardavids/EcomCarRental.git
   cd EcomCarRental
   ```
2. **Install NPM packages**
   ```bash
   cd backend
   npm install
   ```
   ```bash
   cd frontend
   npm install
   ```
3. **Setup the MySQL Database**
- Open MySQL Workbench and create a new schema
- Navigate to the "database" directory in the project folder
- Execute the SQL script to create the necessary tables and populate them with the initial data
3. **Run website**
- Run backend
   ```bash
   npm run start
   ```
- Run frontend
   ```bash
   npm run dev
   ```

Credentials for Testing

Admin Login:

Email: admin@gmail.com

Password: admin123

Customer Login:
  
## Configuration
To run the project, you need to configure environment files (*.env*) for both backend and frontend.
1.**Backend *.env file***:
   ```bash
   PORT=5005
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   EMAIL_HOST=your_email_smtp_host
   EMAIL_PORT=your_email_smtp_port
   EMAIL_USER=your_email_address
   EMAIL_PASS=your_email_password
   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   JWT_SECRET=your_jwt_secret
   GOOGLE_CLIENT_ID=your_google_client_id_here
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   ```
2.**Frontend *.env file***:
   ```bash
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   STRIPE_SECRET_KEY=your_stripe_secret_key_here
   ```
