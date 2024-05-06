import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

export const verifyToken = async (req, res, next) => {
    try {

        const token = req.header("Authorization")?.replace("Bearer ", "");




        if (!token) {
            throw new ApiError(401, "Unauthorized access");
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);



        if (!decoded) {
            throw new ApiError(401, "Invalid Access Token");
        }


        const user = await User.findOne({ _id: decoded.payload.userId }).select("-password");
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();

    } catch (error) {

        res.status(error.statusCode || 500).json({
            message: error || "Invalid Authentication Token"
        })
    }
}