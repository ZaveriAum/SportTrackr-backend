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

        const url = `http://localhost:5000/v1/auth/confirmation/${token}`

        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to SportTrackr: Verify Your Account',
            html: `
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Helvetica', 'Arial', sans-serif;
                            background-color: #e7f1fc;
                            margin: 0;
                            padding: 0;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            padding: 20px;
                            border-radius: 10px;
                            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            text-align: center;
                            padding: 15px 0;
                            background-color: #809D3C;
                            color: white;
                            border-radius: 10px 10px 0 0;
                            font-size: 24px;
                            font-weight: bold;
                        }
                        .content {
                            padding: 20px;
                            text-align: center;
                            background-color: #5D8736;
                        }
                        .content p {
                            margin: 10px 0;
                        }
                        .verification-link {
                            display: inline-block;
                            margin-top: 20px;
                            background-color: #F4FFC3;
                            color: white;
                            padding: 12px 25px;
                            text-decoration: none;
                            border-radius: 5px;
                            font-size: 16px;
                            transition: background-color 0.3s ease;
                        }
                        .verification-link:hover {
                            background-color: #F4FFC3;
                        }
                        .footer {
                            margin-top: 15px;
                            text-align: center;
                            color: #555;
                            font-size: 14px;
                            background-color: #809D3C;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            SportTrackr Account Verification
                        </div>
                        <div class="content">
                            <p>Welcome to SportTrackr! Ready to kick off your journey with us?</p>
                            <p>Verify your email address to access exciting sports features and connect with your league. Expires in 5 minutes</p>
                            <a href="${url}" class="verification-link">Verify My Account</a>
                        </div>
                        <div class="footer">
                            <p>If you didn't request this, please ignore this email.</p>
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

        // Mail options including recipient, subject, and HTML content with reset link
        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'SportTrackr: Reset Your Password',
            html: `
                <html>
                <body>
                    <p>You requested a password reset for your SportTrackr account.</p>
                    <p><a href="${process.env.FRONTEND_URL}/v1/auth/reset/${resetToken}">Reset Your Password</a></p>
                    <p>If you did not request this, please ignore this email.</p>
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
            subject: `Welcome to SportTrackr, ${userName}!`,
            html: `
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Helvetica', 'Arial', sans-serif;
                            background-color: #e7f1fc;
                            margin: 0;
                            padding: 0;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #ffffff;
                            padding: 20px;
                            border-radius: 10px;
                            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            text-align: center;
                            padding: 15px 0;
                            background-color: #809D3C;
                            color: white;
                            border-radius: 10px 10px 0 0;
                            font-size: 24px;
                            font-weight: bold;
                        }
                        .content {
                            padding: 20px;
                            text-align: center;
                            background-color: #5D8736;
                        }
                        .content p {
                            margin: 10px 0;
                        }
                        .cta-link {
                            display: inline-block;
                            margin-top: 20px;
                            background-color: #28a745;
                            color: black;
                            padding: 12px 25px;
                            text-decoration: none;
                            border-radius: 5px;
                            font-size: 16px;
                            transition: background-color 0.3s ease;
                        }
                        .cta-link:hover {
                            background-color: #F4FFC3;
                        }
                        .footer {
                            margin-top: 15px;
                            text-align: center;
                            color: #555;
                            font-size: 14px;
                            background-color: #809D3C;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            Welcome to SportTrackr, ${userName}!
                        </div>
                        <div class="content">
                            <p>We're thrilled to have you on board!</p>
                            <p>SportTrackr is designed to help you manage leagues, track performances, and connect with your community seamlessly.</p>
                            <a href="${process.env.FRONTEND_URL}/dashboard" class="cta-link">Explore Your Dashboard</a> 
                        </div>
                        <div class="footer">
                            <p>If you have any questions or need assistance, feel free to reach out to us!</p>
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