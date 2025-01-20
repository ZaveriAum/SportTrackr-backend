const nodemailer = require('nodemailer');
require('dotenv').config();
const { BAD_REQUEST } = require('../config/errorCodes');

const sendVerificationEmail = async (email, token) => {
    try{
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const url = `${process.env.FRONTEND_URL}/register/${token}`

        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to SportTrackr: Verify Your Account',
            html: `
                <html>
                    <head>
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Jersey+20&display=swap');
                        
                            body {
                                margin: 0;
                                padding: 0;
                                background-color: #f3f3f3;
                                font-family: "Jersey 20", serif;
                            }
                        
                            .container {
                                max-width: 700px;
                                margin: 30px auto;
                                background-color: #ffffff;
                                border-radius: 15px;
                                overflow: hidden;
                                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
                                border: 1px solid #dddddd;
                            }
                        
                            .header {
                                background: linear-gradient(90deg, #00a859, #004f2b);
                                color: #ffffff;
                                text-align: center;
                                padding: 50px 20px;
                            }
                        
                            .header h1 {
                                font-size: 45px;
                                margin: 0;
                                font-weight: 800;
                            }
                        
                            .content {
                                padding: 30px 20px;
                                text-align: center;
                                background-color: #f7fff8;
                                color: #070e05;
                            }
                        
                            .content p {
                                font-size: 18px;
                                line-height: 1.8;
                                margin-bottom: 20px;
                            }
                        
                            .verification-link {
                                display: inline-block;
                                padding: 12px 30px;
                                background-color: #00a859;
                                color: #ffffff;
                                font-size: 18px;
                                font-weight: 600;
                                text-decoration: none;
                                border-radius: 8px;
                                transition: background-color 0.3s ease;
                            }
                        
                            .verification-link:hover {
                                background-color: #02fa8a;
                            }
                        
                            .footer {
                                text-align: center;
                                padding: 5px;
                                font-size: 19px;
                                color: #ffffff;
                                background: linear-gradient(90deg, #00a859, #004f2b);
                            }
                        
                            .footer a {
                                color: #ffffff;
                                text-decoration: none;
                            }
                        
                            .footer a:hover {
                                text-decoration: underline;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                        <div class="header">
                            <h1>SportTrackr Account Verification</h1>
                        </div>
                        
                        <div class="content">
                            <p>Welcome to SportTrackr! Ready to kick off your journey with us?</p>
                            <p>Verify your email address to access exciting sports features and connect with your league. This link expires in 5 minutes.</p>
                            <a href="${url}" class="verification-link">Verify My Account</a>
                        </div>
                        
                        <div class="footer">
                            <p>Stay connected with us:</p>
                            <p>
                                <a href="https://facebook.com">Facebook</a> |
                                <a href="https://twitter.com">Twitter</a> |
                                <a href="https://instagram.com">Instagram</a>
                            </p>
                            <p>&copy; 2025 SportTrackr. All rights reserved.</p>
                        </div>
                        </div>
                    </body>
                </html>
            `
        };        
        await transporter.sendMail(mailOptions);
        return true;
    }catch(e){
        throw new Error(BAD_REQUEST.EMAIL_NOT_SEND);
    }
}

const sendResetPasswordEmail = async (email, resetToken) => {
    try {
        // Create a transporter object for sending emails
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const url = `${process.env.FRONTEND_URL}/reset/${resetToken}`

        // Mail options including recipient, subject, and HTML content with reset link
        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'SportTrackr: Reset Your Password',
            html: `
                <html>
                    <head>
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Jersey+20&display=swap');

                            body {
                                margin: 0;
                                padding: 0;
                                background-color: #f3f3f3;
                                font-family: "Jersey 20", serif;
                            }

                            .email-container {
                                max-width: 700px;
                                margin: 30px auto;
                                background-color: #ffffff;
                                border-radius: 15px;
                                overflow: hidden;
                                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
                                border: 1px solid #dddddd;
                            }

                            .header {
                                background: linear-gradient(90deg, #00a859, #004f2b);
                                color: #ffffff;
                                text-align: center;
                                padding: 50px 20px;
                            }
                            
                            .header h1 {
                                font-size: 50px;
                                margin: 0;
                                font-weight: 800;
                            }

                            .content {
                                padding: 30px 20px;
                                text-align: left;
                                color: #333333;
                            }

                            .content p {
                                line-height: 1.8;
                                margin-bottom: 20px;
                                font-size: 20px;
                                color: #070e05;
                            }

                            .content a {
                                display: inline-block;
                                padding: 2px 5px;
                                background-color: #00a859;
                                color: #ffffff;
                                font-size: 18px;
                                font-weight: 600;
                                text-decoration: none;
                                border-radius: 8px;
                                transition: background-color 0.3s ease;
                            }

                            .content a:hover {
                                background-color: #004f2b;
                            }

                            .footer {
                                text-align: center;
                                padding: 5px;
                                font-size: 19px;
                                color: #ffffff;
                                background: linear-gradient(90deg, #00a859, #004f2b);
                            }

                            .footer a {
                                color: #ffffff;
                                text-decoration: none;
                            }

                            .footer a:hover {
                                text-decoration: underline;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="email-container">
                            <div class="header">
                                <h1>Password Reset Request</h1>
                            </div>

                            <div class="content">
                                <p>You requested a password reset for your SportTrackr account. Please click the button below to reset your password:</p>
                                <p>
                                <a href="${url}">Reset Your Password</a>
                                </p>
                                <p>If you did not request this, please ignore this email or contact our support team for assistance.</p>
                            </div>

                            <div class="footer">
                                <p>Stay connected with us:</p>
                                <p>
                                    <a href="https://facebook.com">Facebook</a> |
                                    <a href="https://twitter.com">Twitter</a> |
                                    <a href="https://instagram.com">Instagram</a>
                                </p>
                                <p>&copy; 2025 SportTrackr. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                </html>
            `
        };

        // Send the email
        await transporter.sendMail(mailOptions);
    } catch (error) {
        // Handle email sending issues
        throw new Error(BAD_REQUEST.EMAIL_NOT_SEND);
    }
};

const sendWelcomeEmail = async (email, userName) => {
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to SportTrackr',
            html: `
                <html>
                <head>
                    <style>
                    @import url('https://fonts.googleapis.com/css2?family=Jersey+20&display=swap');
                
                    body {
                    margin: 0;
                    padding: 0;
                    background-color: #f3f3f3;
                    font-family: "Jersey 20", serif;
                    }
                
                    .email-container {
                    max-width: 700px;
                    margin: 30px auto;
                    background-color: #ffffff;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
                    border: 1px solid #dddddd;
                    }
                
                    .header {
                    background: linear-gradient(90deg, #00a859, #004f2b);
                    color: #ffffff;
                    text-align: center;
                    padding: 50px 20px;
                    }
                
                    .header h1 {
                    font-size: 60px;
                    margin: 0;
                    font-weight: 800;
                    text-transform: uppercase;
                    }
                
                    .header p {
                    margin-top: 10px;
                    font-size: 25px;
                    color: #e0e0e0;
                    }
                
                    .hero-image {
                    width: 100%;
                    max-height: 300px;
                    object-fit: cover;
                    display: block;
                    }
                
                    .content {
                    padding: 30px 20px;
                    text-align: left;
                    color: #333333;
                    }
                
                    .content h2 {
                    font-size: 30px;
                    margin: 0 0 15px;
                    color: #00a859;
                    }
                
                    .content p {
                    line-height: 1.8;
                    margin-bottom: 20px;
                    font-size: 20px;
                    color: #070e05;
                    }
                
                    .content h3 {
                    font-size: 24px;
                    margin: 0 0 15px;
                    color: #000000;
                    }
                
                    .content ul {
                    padding-left: 20px;
                    list-style: disc;
                    margin: 20px 0;
                    }
                
                    .content ul li {
                    margin-bottom: 10px;
                    font-size: 20px;
                    color: black;
                    }
                
                    .cta-buttons {
                    text-align: center;
                    /*margin: 30px 0 20px;*/
                    }
                
                    .cta-buttons a {
                    display: inline-block;
                    margin: 10px 15px;
                    padding: 15px 40px;
                    background-color: #00a859;
                    color: #ffffff;
                    font-size: 18px;
                    font-weight: 600;
                    text-decoration: none;
                    border-radius: 8px;
                    transition: background-color 0.3s ease;
                    }
                
                    .cta-buttons a:hover {
                    background-color: #004f2b;
                    }
                
                    .footer {
                    text-align: center;
                    padding: 20px;
                    font-size: 20px;
                    color: #FFFFFF;
                    background: linear-gradient(90deg, #00a859, #004f2b);
                    }
                
                    .footer a {
                    color: #FFFFFF;
                    text-decoration: none;
                    }
                
                    .footer a:hover {
                    text-decoration: underline;
                    }
                </style>
                </head>
                <body>
                    <div class="email-container">
                    <!-- Header Section -->
                    <div class="header">
                        <h1>Welcome to Sport Trackr</h1>
                        <p>Your ultimate football league management tool</p>
                    </div>
                    
                    <div class="content">
                        <h2>Welcome, ${userName}!</h2>
                        <p>We’re thrilled to have you join our growing football community! At Sport Trackr, we’re all about simplifying football league management, connecting players, and making every game count.</p>
                    
                        <h3>What you can do with Sport Trackr:</h3>
                        <ul>
                        <li>📊 Manage leagues effortlessly with intuitive tools.</li>
                        <li>⚽ Track match results, stats, and player performances.</li>
                        <li>🤝 Connect with other players and teams in your area.</li>
                        <li>🏆 Create tournaments and crown champions.</li>
                        <li>🔔 Get real-time updates on league standings and more!</li>
                        </ul>
                    
                        <p>Sport Trackr is your all-in-one platform for managing, competing, and thriving in the football world. Let’s take your game to the next level!</p>
                    
                        <div class="cta-buttons">
                            <a href="https://yourapp.com/download">Download the App</a>
                            <a href="https://yourapp.com/explore">Explore More</a>
                        </div>
                    </div>
                    
                        <div class="footer">
                            <p>Stay connected with us:</p>
                            <p>
                            <a href="https://facebook.com">Facebook</a> |
                            <a href="https://twitter.com">Twitter</a> |
                            <a href="https://instagram.com">Instagram</a>
                            </p>
                            <p>&copy; 2025 Sport Trackr. All rights reserved.</p>
                        </div>
                    </div>
                </body>
            </html>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error(BAD_REQUEST.EMAIL_NOT_SEND);
    }
};

module.exports = {
    sendVerificationEmail,
    sendResetPasswordEmail,
    sendWelcomeEmail
}