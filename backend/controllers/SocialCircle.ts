import { getTokenStorage } from "../helpers/tokenStorage.js";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import SocialCircle, { ISocialCircle } from "../models/SocialCircle.js";
import UserProfile from "../models/UserProfile.js";

const createSocialCircle = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { token } = req.cookies;
    const tokenStorage = getTokenStorage();
    if (!tokenStorage[token]) {
        return res.status(401).json({ message: "Invalid token" });
    }

    try {
        const userId = tokenStorage[token].id;
        const { name } = req.body;

        // check if social circle already exists
        const existingSocialCircle = await SocialCircle.findOne({
            name,
        });
        if (existingSocialCircle) {
            return res
                .status(400)
                .json({ message: "Social circle already exists" });
        }

        const socialCircle = new SocialCircle({
            name,
            ownerId: userId,
            members: [userId],
        });
        const savedSocialCircle = await socialCircle.save();
        res.status(201).json({ socialCircle: savedSocialCircle });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

const getSocialCirclesByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { token } = req.cookies;
    const tokenStorage = getTokenStorage();
    if (!tokenStorage[token]) {
        return res.status(401).json({ message: "Invalid token" });
    }
    const userId = tokenStorage[token].id;
    try {
        const socialCircles = await SocialCircle.find({
            members: { $in: [userId] },
        });
        res.status(200).json({ socialCircles });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

const joinCircleByCode = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { token } = req.cookies;
    const tokenStorage = getTokenStorage();
    if (!tokenStorage[token]) {
        return res.status(401).json({ message: "Invalid token" });
    }
    const userId = tokenStorage[token].id;
    const { id } = req.body;
    try {
        const socialCircle = await SocialCircle.findById(id);
        if (!socialCircle) {
            return res.status(404).json({ message: "Social circle not found" });
        }
        if (socialCircle.members.includes(userId)) {
            return res
                .status(400)
                .json({ message: "You are already a member of this circle" });
        }
        socialCircle.members.push(userId);
        const savedSocialCircle = await socialCircle.save();
        res.status(200).json({ socialCircle: savedSocialCircle });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

const getCircleById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { token } = req.cookies;
    const tokenStorage = getTokenStorage();
    if (!tokenStorage[token]) {
        return res.status(401).json({ message: "Invalid token" });
    }
    const userId = tokenStorage[token].id;
    const { id } = req.params;
    try {
        const socialCircle = await SocialCircle.findById(id);
        if (!socialCircle) {
            return res.status(404).json({ message: "Social circle not found" });
        }
        if (!socialCircle.members.includes(userId)) {
            return res
                .status(401)
                .json({ message: "You are not a member of this circle" });
        }
        res.status(200).json({ socialCircle });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

const addUserToSocialCircle = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { token } = req.cookies;
    const tokenStorage = getTokenStorage();
    if (!tokenStorage[token]) {
        return res.status(401).json({ message: "Invalid token" });
    }
    const userId = tokenStorage[token].id;
    const { id } = req.params;
    try {
        const socialCircle = await SocialCircle.findById(id);
        if (!socialCircle) {
            return res.status(404).json({ message: "Social circle not found" });
        }
        if (socialCircle.members.includes(userId)) {
            return res
                .status(400)
                .json({ message: "You are already a member of this circle" });
        }
        socialCircle.members.push(userId);
        const savedSocialCircle = await socialCircle.save();
        return res.status(200).json({ socialCircle: savedSocialCircle });
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
};

const deleteSocialCircle = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { token } = req.cookies;
    const tokenStorage = getTokenStorage();
    if (!tokenStorage[token]) {
        return res.status(401).json({ message: "Invalid token" });
    }

    const userId = tokenStorage[token].id;
    const { id } = req.params;

    // check if user is owner of social circle
    const socialCircle = await SocialCircle.findById(id);
    if (!socialCircle) {
        return res.status(404).json({ message: "Social circle not found" });
    }
    if (socialCircle.ownerId !== userId) {
        return res.status(401).json({ message: "Not authorized" });
    }

    return SocialCircle.findByIdAndDelete(id)
        .then((socialCircle) => res.status(200).json({ socialCircle }))
        .catch((error) => {
            res.status(500).json({ error });
        });
};

const getMembersBySocialCircleId = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { token } = req.cookies;
    const tokenStorage = getTokenStorage();
    if (!tokenStorage[token]) {
        return res.status(401).json({ message: "Invalid token" });
    }
    const userId = tokenStorage[token].id;
    const { id } = req.params;
    try {
        const socialCircle = await SocialCircle.findById(id);
        if (!socialCircle) {
            return res.status(404).json({ message: "Social circle not found" });
        }
        if (!socialCircle.members.includes(userId)) {
            return res.status(401).json({ message: "Not authorized" });
        }

        const members = await UserProfile.find({
            _id: { $in: socialCircle.members },
        });

        return res.status(200).json({ members: members });
    } catch (error: any) {
        return res.status(400).json({ message: error.message });
    }
};

export default {
    createSocialCircle,
    getSocialCirclesByUserId,
    joinCircleByCode,
    getCircleById,
    addUserToSocialCircle,
    deleteSocialCircle,
    getMembersBySocialCircleId,
};
