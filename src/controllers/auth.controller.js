import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";


export const signup = async (req, res) => {


    try {


        const { fullName, email, password, username, gender } = req.body;
        if (
            [fullName, email, username, password, gender].some((field) => field?.trim() === "")
        ) {
            throw new ApiError(400, "All fields are required")
        }


        const existedUser = await User.findOne({
            $or: [{ email: email }, { username: username }]
        })

        if (existedUser) {
            throw new ApiError(400, "User already exists")
        }

        const avatarLocalPath = req?.file?.path;

        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required")
        }

        const avatarURL = await uploadToCloudinary(avatarLocalPath);
        if (!avatarURL) {
            throw new ApiError(400, "Avatar file is required")
        }

        const newUser = await User.create({
            fullName,
            email,
            password,
            username,
            gender,
            avatar: avatarURL.url,

        })



        const createdUser = await User.findById(newUser._id).select("-password")

        if (!createdUser) {
            throw new ApiError(500, "Error while creating user")
        }

        return res.status(200).json(new ApiResponse(200, createdUser, "User created successfully"))



    } catch (error) {

        res.status(error.statusCode || 500).json({
            message: error || "Internal Server Error"
        })
    }







}


export const login = async (req, res) => {

    try {
        const { email, password } = req.body;

        if ([email, password].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "All fields are required")
        }


        const existedUser = await User.findOne({
            email: email
        })

        if (!existedUser) {
            throw new ApiError(404, "User not found");
        }

        const isPasswordCorrect = await existedUser.matchPasswords(password);
        if (!isPasswordCorrect) {
            throw new ApiError(400, "Invalid credentials");
        }

        const accessToken = await existedUser.generateAccessToken();



        const loggedUser = await User.findById(existedUser._id).select("-password");



        const options = {
            httpOnly: false,
            secure: true,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        }



        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .json(new ApiResponse(200, { loggedUser, accessToken }, "Logged in successfully"))






    }
    catch (error) {
        res.status(error.statusCode || 500).json({
            message: error || "Internal Server Error"
        })
    }




}



export const getUser = async (req, res) => {
    try {
        const user_id = req.user._id;

        if (!user_id) {
            throw new ApiError(401, "Unauthorized access");
        }

        const user = await User.findById(user_id).select("-password");

        return res.status(200).json(new ApiResponse(200, user, "User fetched successfully"))


    } catch (error) {

        res.status(error.statusCode || 500).json({
            message: error || "Internal Server Error"
        })

    }


}

export const logout = (req, res) => {
    try {
        const options = {
            httpOnly: false,
            secure: true,
        }

        return res
            .status(200)
            .clearCookie("accessToken", options)

            .json(new ApiResponse(200, {}, "User logged Out"))
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error || "Internal Server Error"
        })
    }



}