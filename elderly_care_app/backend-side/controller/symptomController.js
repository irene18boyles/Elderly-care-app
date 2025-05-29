import mongoose from "mongoose";

import Symptom from "../models/SymptomTracker.js";
import MainUser from "../models/MainUser.js";
import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const createSymptom = async (req, res) => {
  try {
    const { name, description, elderlyPerson } = req.body;
    const loggedBy = req.user.id;

    if (!name)
      return res.status(400).json({ message: "Symptom name is required" });

    const newSymptom = new Symptom({
      name,
      description,
      loggedBy,
      elderlyPerson,
    });
    await newSymptom.save();

    res.status(201).json(newSymptom);
  } catch (error) {
    res.status(500).json({ message: "Server error creating symptom", error });
  }
};

export const getSymptoms = async (req, res) => {
  try {
    const symptoms = await Symptom.find()
      .populate("loggedBy", "name email")
      .limit(100);
    res.json(symptoms);
  } catch (error) {
    console.error("Error fetching symptoms:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteSymptom = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid symptom ID" });
    }

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const symptom = await Symptom.findById(id);

    if (!symptom) {
      return res.status(404).json({ message: "Symptom not found" });
    }

    if (!symptom.loggedBy) {
      return res.status(400).json({ message: "Symptom missing loggedBy user" });
    }

    if (
      symptom.loggedBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this symptom" });
    }

    await Symptom.findByIdAndDelete(id);

    res.json({ message: "Symptom deleted" });
  } catch (error) {
    console.error("Delete symptom error:", error);
    res.status(500).json({ message: "Error deleting symptom", error });
  }
};

export const getSymptomTrends = async (req, res) => {
  try {
    const { elderlyPerson } = req.query;

    if (!elderlyPerson || !mongoose.Types.ObjectId.isValid(elderlyPerson)) {
      return res
        .status(400)
        .json({ message: "Valid elderlyPerson ID is required" });
    }

    const trends = await Symptom.aggregate([
      { $match: { elderlyPerson: new mongoose.Types.ObjectId(elderlyPerson) } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$dateLogged" } },
            name: "$name",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.day": 1 } },
    ]);

    res.json(trends);
  } catch (error) {
    console.error("Error fetching symptom trends:", error);
    res.status(500).json({ message: "Error fetching trends", error });
  }
};

export const getAISuggestion = async (req, res) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ message: "Symptoms are required" });
    }

    const prompt = `
    Provide gentle activity suggestions or first-aid advice in bullet points using Markdown format for an elderly person experiencing the following symptoms: ${symptoms.join(", ")}.
    Ensure suggestions are kind, practical, and age-appropriate.
    `;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });
    
    const suggestion = result.response.text();

    res.json({ suggestion });
  } catch (error) {
    console.error("Gemini AI suggestion error:", error);

    // Check for quota error (status code 429)
    if (error.status === 429) {
      return res.status(429).json({
        message:
          "AI suggestion quota exceeded. Please try again later or upgrade your API plan.",
      });
    }

    res.status(500).json({ message: "Failed to fetch AI suggestion", error: error.message || error,  });
  }
};