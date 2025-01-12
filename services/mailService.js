const nodemailer = require('nodemailer');
require('dotenv').config();

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
                            background-color: #007bff;
                            color: white;
                            border-radius: 10px 10px 0 0;
                            font-size: 24px;
                            font-weight: bold;
                        }
                        .content {
                            padding: 20px;
                            text-align: center;
                        }
                        .content p {
                            margin: 10px 0;
                        }
                        .verification-link {
                            display: inline-block;
                            margin-top: 20px;
                            background-color: #28a745;
                            color: white;
                            padding: 12px 25px;
                            text-decoration: none;
                            border-radius: 5px;
                            font-size: 16px;
                            transition: background-color 0.3s ease;
                        }
                        .verification-link:hover {
                            background-color: #218838;
                        }
                        .footer {
                            margin-top: 15px;
                            text-align: center;
                            color: #555;
                            font-size: 14px;
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
        console.log(e)
    }
}

module.exports = {
    sendVerificationEmail
}