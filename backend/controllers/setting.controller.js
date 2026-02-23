import Setting from '../models/Setting.js';

// Get Site Settings
export const getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();

        // If no settings exist yet, create a default one
        if (!settings) {
            settings = await Setting.create({});
        }
        res.status(200).json({ success: true, settings });
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ success: false, message: "Failed to fetch settings" });
    }
};

// Update Site Settings (Admin Only)
export const updateSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne();

        if (!settings) {
            settings = new Setting();
        }

        const { siteName, contactEmail, contactPhone, contactAddress, currency, socialLinks, seoDescription } = req.body;

        if (siteName !== undefined) settings.siteName = siteName;
        if (contactEmail !== undefined) settings.contactEmail = contactEmail;
        if (contactPhone !== undefined) settings.contactPhone = contactPhone;
        if (contactAddress !== undefined) settings.contactAddress = contactAddress;
        if (currency !== undefined) settings.currency = currency;
        if (seoDescription !== undefined) settings.seoDescription = seoDescription;

        if (socialLinks) {
            settings.socialLinks = {
                ...settings.socialLinks,
                ...socialLinks
            };
        }

        await settings.save();
        res.status(200).json({ success: true, settings, message: "Settings updated successfully" });
    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ success: false, message: "Failed to update settings" });
    }
};
