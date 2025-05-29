import Medication from '../models/Medication.js';

const autoDeleteTakenMeds = async () => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  try {
    const result = await Medication.deleteMany({
      taken: true,
      takenAt: { $lt: tenMinutesAgo },
    });

    if (result.deletedCount > 0) {
    }
  } catch (err) {
    console.error('Auto-delete error:', err.message);
  }
};

setInterval(autoDeleteTakenMeds, 60 * 1000);

export default autoDeleteTakenMeds;
