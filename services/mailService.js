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
<!doctype html>
<html lang="und" dir="auto" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
  <title></title>
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style type="text/css">
    #outlook a {
      padding: 0;
    }

    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }

    p {
      display: block;
      margin: 13px 0;
    }

  </style>
  <!--[if mso]>
    <noscript>
    <xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
    </xml>
    </noscript>
    <![endif]-->
  <!--[if lte mso 11]>
    <style type="text/css">
      .mj-outlook-group-fix { width:100% !important; }
    </style>
    <![endif]-->
  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
  <style type="text/css">
    @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);

  </style>
  <!--<![endif]-->
  <style type="text/css">
    @media only screen and (min-width:480px) {
      .mj-column-per-100 {
        width: 100% !important;
        max-width: 100%;
      }
    }

  </style>
  <style media="screen and (min-width:480px)">
    .moz-text-html .mj-column-per-100 {
      width: 100% !important;
      max-width: 100%;
    }

  </style>
  <style type="text/css">
    @media only screen and (max-width:479px) {
      table.mj-full-width-mobile {
        width: 100% !important;
      }

      td.mj-full-width-mobile {
        width: auto !important;
      }
    }

  </style>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Jersey+20&display=swap');

  </style>
</head>

<body style="word-spacing:normal;background-color:#F0F0F0;padding:10px;">
  <div style="background-color:#F0F0F0;" lang="und" dir="auto">
    <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#31363F" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="background:#31363F;background-color:#31363F;margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#31363F;background-color:#31363F;width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:middle;width:600px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:middle;" width="100%">
                  <tbody>
                    <tr>
                      <td align="right" style="font-size:0px;padding:0;padding-right:20px;word-break:break-word;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                          <tbody>
                            <tr>
                              <td style="width:70px;">
                                <img alt="" src="https://cdn.discordapp.com/attachments/1158431507124330566/1332910691451142165/Logo3.png?ex=6796f951&is=6795a7d1&hm=9455d87931bd47587ea8b8b8a7707df95a4c5bd19b053d66885a1f73fab70b22&" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="70" height="auto" />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:0;padding-top:20px;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                  <tbody>
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <div style="font-family:'Jersey 20', sans-serif;font-size:30px;line-height:1;text-align:left;color:#555555;">SportTrackr Account Verification</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;line-height:1;text-align:left;color:#696C72;">Welcome to SportTrackr! Ready to kick off your journey with us?</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;line-height:1;text-align:left;color:#696C72;">Verify your email address to access exciting sports features and connect with your league. This link expires in 30 minutes.</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="font-size:0px;padding:10px 25px;padding-top:30px;word-break:break-word;">
                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;width:200px;line-height:100%;">
                          <tbody>
                            <tr>
                              <td align="center" bgcolor="#31363F" role="presentation" style="border:none;border-radius:3px;cursor:auto;mso-padding-alt:10px 25px;background:#31363F;" valign="middle">
                                <a href=`+url+` style="display:inline-block;width:150px;background:#31363F;color:#ffffff;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;mso-padding-alt:0px;border-radius:3px;"> Verify Account </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:center;color:#555555;"></div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
    <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
        <tbody>
          <tr>
            <td style="direction:ltr;font-size:0px;padding:0;text-align:center;">
              <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                  <tbody>
                    <tr>
                      <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <p style="border-top:solid 2px #000000;font-size:1px;margin:0px auto;width:100%;">
                        </p>
                        <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 2px #000000;font-size:1px;margin:0px auto;width:550px;" role="presentation" width="550px" ><tr><td style="height:0;line-height:0;"> &nbsp;
</td></tr></table><![endif]-->
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:center;color:#555555;">This is an auto-generated email. Please do not reply to this message. For help with any questions about your SportTrackr account, please contact us here.</div>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                        <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:center;color:#555555;">© 2025 SportTrackr. All rights reserved.</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!--[if mso | IE]></td></tr></table><![endif]-->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!--[if mso | IE]></td></tr></table><![endif]-->
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

const sendLeagueOwnerConfirmation = async (email, name, dashboardUrl) => {
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
        subject: 'League Owner Confirmation',
        html: `
        <!doctype html>
        <html lang="und" dir="auto" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        
        <head>
          <title></title>
          <!--[if !mso]><!-->
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <!--<![endif]-->
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style type="text/css">
            #outlook a {
              padding: 0;
            }
        
            body {
              margin: 0;
              padding: 0;
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
            }
        
            table,
            td {
              border-collapse: collapse;
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
            }
        
            img {
              border: 0;
              height: auto;
              line-height: 100%;
              outline: none;
              text-decoration: none;
              -ms-interpolation-mode: bicubic;
            }
        
            p {
              display: block;
              margin: 13px 0;
            }
        
          </style>
          <!--[if mso]>
          <noscript>
            <xml>
              <o:OfficeDocumentSettings>
                <o:AllowPNG/>
                <o:PixelsPerInch>96</o:PixelsPerInch>
              </o:OfficeDocumentSettings>
            </xml>
          </noscript>
          <![endif]-->
          <!--[if lte mso 11]>
          <style type="text/css">
            .mj-outlook-group-fix { width:100% !important; }
          </style>
          <![endif]-->
          <!--[if !mso]><!-->
          <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
          <style type="text/css">
            @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
        
          </style>
          <!--<![endif]-->
          <style type="text/css">
            @media only screen and (min-width:480px) {
              .mj-column-per-100 {
                width: 100% !important;
                max-width: 100%;
              }
            }
        
          </style>
          <style media="screen and (min-width:480px)">
            .moz-text-html .mj-column-per-100 {
              width: 100% !important;
              max-width: 100%;
            }
        
          </style>
          <style type="text/css">
            @media only screen and (max-width:479px) {
              table.mj-full-width-mobile {
                width: 100% !important;
              }
        
              td.mj-full-width-mobile {
                width: auto !important;
              }
            }
        
          </style>
          <style type="text/css">
            @import url('https://fonts.googleapis.com/css2?family=Jersey+20&display=swap');
        
          </style>
        </head>
        
        <body style="word-spacing:normal;background-color:#F0F0F0;padding:10px;">
        <div style="background-color:#F0F0F0;" lang="und" dir="auto">
          <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#31363F" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
          <div style="background:#31363F;background-color:#31363F;margin:0px auto;max-width:600px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#31363F;background-color:#31363F;width:100%;">
              <tbody>
              <tr>
                <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:middle;width:600px;" ><![endif]-->
                  <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:middle;" width="100%">
                      <tbody>
                      <tr>
                        <td align="right" style="font-size:0px;padding:0;padding-right:20px;word-break:break-word;">
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                            <tbody>
                            <tr>
                              <td style="width:70px;">
                                <img alt="" src="https://cdn.discordapp.com/attachments/1158431507124330566/1332910691451142165/Logo3.png?ex=6796f951&is=6795a7d1&hm=9455d87931bd47587ea8b8b8a7707df95a4c5bd19b053d66885a1f73fab70b22&" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="70" height="auto" />
                              </td>
                            </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                  <!--[if mso | IE]></td></tr></table><![endif]-->
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
          <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
              <tbody>
              <tr>
                <td style="direction:ltr;font-size:0px;padding:0;padding-top:20px;text-align:center;">
                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                  <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                      <tbody>
                      <tr>
                        <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                          <div style="font-family:'Jersey 20', sans-serif;font-size:30px;line-height:1;text-align:left;color:#555555;">SportTrackr League Owner Confirmation</div>
                        </td>
                      </tr>
                      <tr>
                        <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                          <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;line-height:1;text-align:left;color:#696C72;">Congratulations ${name} You have Successfully registered as a league owner</div>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-size:0px;padding:10px 25px;padding-top:30px;word-break:break-word;">
                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;width:200px;line-height:100%;">
                            <tbody>
                            <tr>
                              <td align="center" bgcolor="#31363F" role="presentation" style="border:none;border-radius:3px;cursor:auto;mso-padding-alt:10px 25px;background:#31363F;" valign="middle">
                                <a href='${dashboardUrl}' style="display:inline-block;width:150px;background:#31363F;color:#ffffff;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 25px;mso-padding-alt:0px;border-radius:3px;">Go to Dashboard</a>
                              </td>
                            </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                          <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:center;color:#555555;"></div>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                  <!--[if mso | IE]></td></tr></table><![endif]-->
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
          <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
              <tbody>
              <tr>
                <td style="direction:ltr;font-size:0px;padding:0;text-align:center;">
                  <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
                  <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                    <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                      <tbody>
                      <tr>
                        <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                          <p style="border-top:solid 2px #000000;font-size:1px;margin:0px auto;width:100%;">
                          </p>
                          <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 2px #000000;font-size:1px;margin:0px auto;width:550px;" role="presentation" width="550px" ><tr><td style="height:0;line-height:0;"> &nbsp;
        </td></tr></table><![endif]-->
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                          <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:center;color:#555555;">This is an auto-generated email. Please do not reply to this message. For help with any questions about your SportTrackr account, please contact us here.</div>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                          <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:center;color:#555555;">© 2025 SportTrackr. All rights reserved.</div>
                        </td>
                      </tr>
                      </tbody>
                    </table>
                  </div>
                  <!--[if mso | IE]></td></tr></table><![endif]-->
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <!--[if mso | IE]></td></tr></table><![endif]-->
        </div>
        </body>
        
        </html>
        `
    };

      await transporter.sendMail(mailOptions);
  } catch (error) {
      throw new Error(BAD_REQUEST.EMAIL_NOT_SEND);
  }
}


const sendRequestCompletionLeagueOwnerEmail = async(email, name, url) => {
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
        subject: 'League Owner Registration Step 2',
        html: `
        <!doctype html>
<html lang="und" dir="auto" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
  <title></title>
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style type="text/css">
    #outlook a {
      padding: 0;
    }

    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table,
    td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }

    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }

    p {
      display: block;
      margin: 13px 0;
    }

  </style>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <!--[if lte mso 11]>
  <style type="text/css">
    .mj-outlook-group-fix { width:100% !important; }
  </style>
  <![endif]-->
  <!--[if !mso]><!-->
  <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
  <style type="text/css">
    @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);

  </style>
  <!--<![endif]-->
  <style type="text/css">
    @media only screen and (min-width:480px) {
      .mj-column-per-100 {
        width: 100% !important;
        max-width: 100%;
      }
    }

  </style>
  <style media="screen and (min-width:480px)">
    .moz-text-html .mj-column-per-100 {
      width: 100% !important;
      max-width: 100%;
    }

  </style>
  <style type="text/css">
    @media only screen and (max-width:479px) {
      table.mj-full-width-mobile {
        width: 100% !important;
      }

      td.mj-full-width-mobile {
        width: auto !important;
      }
    }

  </style>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Jersey+20&display=swap');

  </style>
</head>

<body style="word-spacing:normal;background-color:#F0F0F0;padding:10px;">
<div style="background-color:#F0F0F0;" lang="und" dir="auto">
  <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#31363F" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
  <div style="background:#31363F;background-color:#31363F;margin:0px auto;max-width:600px;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#31363F;background-color:#31363F;width:100%;">
      <tbody>
      <tr>
        <td style="direction:ltr;font-size:0px;padding:20px 0;text-align:center;">
          <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:middle;width:600px;" ><![endif]-->
          <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:middle;width:100%;">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:middle;" width="100%">
              <tbody>
              <tr>
                <td align="right" style="font-size:0px;padding:0;padding-right:20px;word-break:break-word;">
                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">
                    <tbody>
                    <tr>
                      <td style="width:70px;">
                        <img alt="" src="https://cdn.discordapp.com/attachments/1158431507124330566/1332910691451142165/Logo3.png?ex=6796f951&is=6795a7d1&hm=9455d87931bd47587ea8b8b8a7707df95a4c5bd19b053d66885a1f73fab70b22&" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;font-size:13px;" width="70" height="auto" />
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <!--[if mso | IE]></td></tr></table><![endif]-->
        </td>
      </tr>
      </tbody>
    </table>
  </div>
  <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
  <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
      <tbody>
      <tr>
        <td style="direction:ltr;font-size:0px;padding:0;padding-top:20px;text-align:center;">
          <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
          <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
              <tbody>
              <tr>
                <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                  <div style="font-family:'Jersey 20', sans-serif;font-size:30px;line-height:1;text-align:left;color:#555555;">SportTrackr League Owner Onboarding Step 2</div>
                </td>
              </tr>
              <tr>
                <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                  <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;line-height:1;text-align:left;color:#696C72;">Congratulations ${name} You have Successfully completed step 1 of registration as league owner.</div>
                </td>
              </tr>
              <tr>
                <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                  <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:16px;line-height:1;text-align:left;color:#696C72;">Now to complete your league owner profile please verify your identity.</div>
                </td>
              </tr>
              <tr>
                <td align="center" style="font-size:0px;padding:10px 25px;padding-top:30px;word-break:break-word;">
                  <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;width:200px;line-height:100%;">
                    <tbody>
                    <tr>
                      <td align="center" bgcolor="#31363F" role="presentation" style="border:none;border-radius:3px;cursor:auto;mso-padding-alt:10px 25px;background:#31363F;" valign="middle">
                        <a href='${url}' style="display:inline-block;width:100px;background:#31363F;color:#ffffff;font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;font-weight:normal;line-height:120%;margin:0;text-decoration:none;text-transform:none;padding:10px 5px;mso-padding-alt:0px;border-radius:3px;">Verify: Step 2</a>
                      </td>
                    </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                  <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:center;color:#555555;"></div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <!--[if mso | IE]></td></tr></table><![endif]-->
        </td>
      </tr>
      </tbody>
    </table>
  </div>
  <!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" role="presentation" style="width:600px;" width="600" bgcolor="#ffffff" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]-->
  <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:600px;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
      <tbody>
      <tr>
        <td style="direction:ltr;font-size:0px;padding:0;text-align:center;">
          <!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]-->
          <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
              <tbody>
              <tr>
                <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                  <p style="border-top:solid 2px #000000;font-size:1px;margin:0px auto;width:100%;">
                  </p>
                  <!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" style="border-top:solid 2px #000000;font-size:1px;margin:0px auto;width:550px;" role="presentation" width="550px" ><tr><td style="height:0;line-height:0;"> &nbsp;
</td></tr></table><![endif]-->
                </td>
              </tr>
              <tr>
                <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                  <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:center;color:#555555;">This is an auto-generated email. Please do not reply to this message. For help with any questions about your SportTrackr account, please contact us here.</div>
                </td>
              </tr>
              <tr>
                <td align="center" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                  <div style="font-family:Ubuntu, Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:center;color:#555555;">© 2025 SportTrackr. All rights reserved.</div>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
          <!--[if mso | IE]></td></tr></table><![endif]-->
        </td>
      </tr>
      </tbody>
    </table>
  </div>
  <!--[if mso | IE]></td></tr></table><![endif]-->
</div>
</body>

</html>
        `
    };

      await transporter.sendMail(mailOptions);
  } catch (error) {
      throw new Error(BAD_REQUEST.EMAIL_NOT_SEND);
  }
}

module.exports = {
    sendVerificationEmail,
    sendResetPasswordEmail,
    sendWelcomeEmail,
    sendLeagueOwnerConfirmation,
    sendRequestCompletionLeagueOwnerEmail
}