import twilio from 'twilio'
import sgMail from '@sendgrid/mail'
import 'dotenv/config'
import {User} from '../models/User.js'

// twilio client initialised for authentication
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
)

//sendgrid api key set for email authentications
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// sending sms notifications
export const sendSmsNotification = async(toPhoneNumber, message) => {
    try {
        // creating a message and sending
        await twilioClient.messages.create({
            body : message,
            from : process.env.TWILIO_PHONE_NUMBER,
            to: toPhoneNumber
        });

        console.log(`SMS sent successfully to ${toPhoneNumber}`);
    }
    catch(err){
        console.error('Twilio SMS error: ', err.message);
    }
}

// send email notifications using sendgrid
export const sendEmailNotifications = async(toEmail, subject, htmlContent) => {
    // create email message object to send
    const msg = {
        to : toEmail,
        from : process.env.ADMIN_EMAIL,
        subject : subject,
        html : htmlContent,
    };

    try{
        // send email
        await sgMail.send(msg);
        console.log(`Email sent successfully to ${toEmail}`);
    } catch(error){
        console.error('SendGrid Email error: ', error.message);
    }
};

// notify citizen about status change
export const notifyCitizenOfStatusChange = async(complaint) => {
    // lookup for the citizen's contact info
      console.log(`--- Attempting to send notification for complaint ID: ${complaint._id} ---`);
    const citizen = await User.findById(complaint.submittedBy).select('name email phone');
    if(!citizen) return;

    // prepare content
    const statusMsg = `Your Complaint (ID : ${complaint._id}) status has been updated to ${complaint.status}.`;
    const emailSubject = `ResolveHub Status Update : ${complaint.status}`;
    const emailHTML = `<h1>Complaint Status Update</h1><p>Dear ${citizen.name},</p><p>${statusMsg}</p><p>Thank you for your patience.</p>`;

    // send notification concurrently
    if(citizen.email){
        sendEmailNotifications(citizen.email, emailSubject, emailHTML);
    }

    if(citizen.phone){
        sendSmsNotification(citizen.phone, statusMsg);
    }
};