import ProfileSetting from "../models/ProfileSettings.js";
import MainUser from "../models/MainUser.js";
import bcrypt from "bcryptjs";

/////////////////////
//get profile details
/////////////////////

const getProfileDetails = async (req, res) => {
    try {
        const userId = req.user.id  // id from the token, either id, userId or _id, check it in the authentication

        const profileDetails = await ProfileSetting.findOne({ userId })

            if(!profileDetails) {
                return res.status(404).json({
                    message: "Profile not found",
                    error: true
                })
            }

            res.status(200).json({
                message: "Profile fetched successfully",
                error: false,
                data: profileDetails // returns the profile details
            })

    } catch (error) {
        res.status(500).json({
            message: "Error fetching profile details",
            error: true
        })

    }
}


const updateProfileDetails = async(req, res) => {
    try {
        const userId = req.user.id

        const updateProfile = await ProfileSetting.findOneAndUpdate(
            { userId },
            req.body, { new: true, runValidators: true } 
        )

        if (!updateProfile) {
            return res.status(200).json({ message : "Profile not found"})
        }

        res.status(200).json({
            message: "Note updated successfully",
            error: false,
            data: updateProfile
        })
    } catch (error) {
        res.status(500).json({
            message: "Error updating profile",
                        error: error.message

        })
    }
}

const updatePassword = async (req, res) => {
    const {currentPassword, newPassword} = req.body
    try {
        const userId = req.user.id
        const user = await MainUser.findById(userId)

        if(!user) {
            res.status(404).json({message: "User not found"})
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if(!isMatch){
            res.status(400).json({message: "Current password is incorrect"})
        }

        user.password = await bcrypt.hash(newPassword, 10)
        await user.save(); // saves the new password to the database

        res.json ({message: "Password updated successfully"})
    } catch (error) {
        res.status(500).json({
            message: "Error updating password",
            error: error.message
        })

    }
}

export {getProfileDetails, updateProfileDetails, updatePassword};