import MedicalRecord from "../models/MedicalRecords.js"; // models schema
import axios from "axios"; // for making api calls

const getAllMedicalRecords = async (req, res) => {
    try {
        const medicalRecords = await MedicalRecord.find()
        console.log(medicalRecords)
        res.status(200).json(medicalRecords)
        
    } catch (error) {
        res.status(500).json({
            message: "Error Fetching Medical records",
            error: error.message
        })
    }
}

const addMedicalRecord = async (req, res) => {
    try {
        const {description, doctorName, category, fileUrl} = req.body
        const newRecord = new MedicalRecord({
            description,
            doctorName,
            category,
            fileUrl,
            uploadAt: Date.now()
        })
        const savedRecord = await newRecord.save() // saving to mongoDB
        
        res.status(201).json({
            message: "Medical Record added successfully",
            error: false,
            data: savedRecord // returning the saved record
        })
    } catch (error) {
        res.status(500).json({
            message: "Error adding medical record",
            error: error.message
        })
        
    }
}

//////////////
//Upload File
/////////////

const uploadFile = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }
        const { description, doctorName, category} = req.body
        const fileUrl = req.file.path // cloudinary url

        //save url to mongodb
        const newRecord = new MedicalRecord({ 
            description,
            doctorName,
            category,
            fileUrl,
            uploadAt: Date.now(),
            // originalName: req.file.originalname, // original file name
            originalName: req.originalFileName || req.file.originalname, // fallback
            mimeType: req.file.mimetype
        })

        const savedRecord = await newRecord.save()
        
        res.status(200).json({
            message: "File Uploaded Successfully",
            url: req.file.path, // cloudinary secure url
            error: false,
            data: savedRecord // retruning the save Record
        })
    } catch (error) {
        res.status(500).json({
            message: "Error Uploadin File",
            error: error.message
        })
        
    }
}

const updateMedicalRecord = async (req, res) => {
    try {
        console.log("Incoming PUT to update record with ID:", req.params.id);
        
        const { id } = req.params
        const { description, doctorName, category } = req.body;

        const updatedRecord = await MedicalRecord.findByIdAndUpdate(
            id,
            { description, doctorName, category },
            { new: true }
        );

        if (!updatedRecord) {
            return res.status(404).json({ message: "Record not found" });
        }

        res.status(200).json({
            message: "Record updated successfully",
            error: false,
            data: updatedRecord
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating medical record",
            error: error.message
        });
    }
}

const deleteMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params

        const deletedRecord = await MedicalRecord.findByIdAndDelete(id)

        if (!deletedRecord) {
            return res.status(404).json({ message: "Record not found" })
        }

        res.status(200).json({
            message: "Record deleted successfully",
            error: false,
            data: deletedRecord
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting medical record",
            error: error.message
        })
    }
}

/////////////////////////////////
//DOWNLOAD FILE WITH CORRECT NAME
/////////////////////////////////
const downloadFile = async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.recordId)

        if(!record || !record.fileUrl){
            return res.status(404).json({ message: "Record or File not founnd"})
        }

        const response = await axios.get(record.fileUrl, {responseType:'stream'})

        //set headers para yung file name pag dinownload is correct filename
        res.setHeader(
            'Content-Disposition', `attachment; filename="${encodeURIComponent(record.originalName)}"`
        );
        res.setHeader("Content-Type", response.headers["content-type"])

        //Pipe the cloudinary response to client response
        response.data.pipe(res)
        
    } catch (error) {
        console.error(error)
        res.status(500).json({
            error: "Error downloadin file"
        })
        
    }
}


export {getAllMedicalRecords, addMedicalRecord, uploadFile, downloadFile, updateMedicalRecord, deleteMedicalRecord}