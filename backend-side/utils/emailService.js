import nodemailer from 'nodemailer';

// Create a test account using Ethereal (for development)
let transporter = null;

async function initializeTransporter() {
    if (transporter) return;

    // Create test account
    const testAccount = await nodemailer.createTestAccount();

    // Create reusable transporter object using the default SMTP transport
    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
}

export const sendAppointmentReminder = async (to, appointment) => {
    await initializeTransporter();

    const { title, date, time, description } = appointment;
    const formattedDate = new Date(date).toLocaleDateString();

    // Format email content
    const emailContent = `
        <h2>Appointment Reminder</h2>
        <p>This is a reminder for your upcoming appointment:</p>
        <ul>
            <li><strong>Title:</strong> ${title}</li>
            <li><strong>Date:</strong> ${formattedDate}</li>
            <li><strong>Time:</strong> ${time}</li>
            ${description ? `<li><strong>Description:</strong> ${description}</li>` : ''}
        </ul>
        <p>Please make sure to arrive on time.</p>
    `;

    try {
        const info = await transporter.sendMail({
            from: '"Elderly Care App" <notifications@elderlycare.com>',
            to: to,
            subject: `Reminder: ${title} - ${formattedDate}`,
            html: emailContent,
        });

        console.log("Email sent successfully");
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}; 