const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const isPdf = localFilePath.toLowerCase().endsWith('.pdf');

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: isPdf ? "raw" : "auto",
        });


        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        try {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
        } catch (e) {
            console.error("Failed to delete local temporary file:", e);
        }
        return null;
    }
};

const generateSignedPdfUrl = (publicIdWithExt, versionStr, resourceType = "image") => {
    const options = {
        resource_type: resourceType,
        type: "upload",
        flags: "attachment",
        secure: true,
        analytics: false
    };
    if (versionStr) {
        options.version = versionStr.replace('v', '');
    }
    return cloudinary.url(publicIdWithExt, options);
};

module.exports = { uploadOnCloudinary, generateSignedPdfUrl };

