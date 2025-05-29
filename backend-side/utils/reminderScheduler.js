import cron from 'node-cron';
import { sendAppointmentReminder } from './emailService.js';
import Appointment from '../models/Appointment.js';
import MainUser from '../models/MainUser.js';
import ContactUser from '../models/ContactUser.js';

// Schedule to run every hour
const CRON_SCHEDULE = '0 * * * *';

async function getUserEmail(userId, userModel) {
    try {
        const Model = userModel === 'MainUser' ? MainUser : ContactUser;
        const user = await Model.findById(userId);
        return user ? user.email : null;
    } catch (error) {
        console.error('Error fetching user email:', error);
        return null;
    }
}

async function checkAndSendReminders() {
    try {
        // Get current time and time 24 hours from now
        const now = new Date();
        const twentyFourHoursFromNow = new Date(now.getTime() + 1 * 60 * 1000);

        // Find appointments in the next 24 hours that haven't had reminders sent
        const upcomingAppointments = await Appointment.find({
            date: {
                $gte: now,
                $lte: twentyFourHoursFromNow
            },
            reminderSent: { $ne: true }
        }).populate('assignedTo');

        for (const appointment of upcomingAppointments) {
            // Get emails for all assigned users
            for (const assignedUser of appointment.assignedTo) {
                const email = await getUserEmail(assignedUser._id, assignedUser.userModel);
                
                if (email) {
                    const success = await sendAppointmentReminder(email, appointment);
                    if (success) {
                        // Mark reminder as sent
                        appointment.reminderSent = true;
                        await appointment.save();
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error in reminder check:', error);
    }
}

export function startReminderScheduler() {
    console.log('Starting reminder scheduler...');
    cron.schedule(CRON_SCHEDULE, checkAndSendReminders);
}

// Export for manual checking (e.g., testing)
export const checkReminders = checkAndSendReminders; 