// import { useState } from "react";

// export default function FileUploadForm() {
//   const [doctorName, setDoctorName] = useState("");
//   const [description, setDescription] = useState("");
//   const [file, setFile] = useState(null);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [message, setMessage] = useState("");
//   const [category, setCategory] = useState("")

//   const handleFileChange = (e) => {
//     if (e.target.files[0]) {
//       setFile(e.target.files[0]);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!doctorName || !description || !file) {
//       setMessage("Please fill all fields and select a file.");
//       return;
//     }

//     // Create FormData to send file + data to backend
//     const formData = new FormData();
//     // formData.append("category", category);
//     formData.append("file", file);
//     formData.append("doctorName", doctorName);
//     formData.append("description", description);


//     try {
//       const res = await fetch("http://localhost:8000/api/medicalrecords/upload", {
//         method: "POST",
//         body: formData,
//       });

//       if (res.ok) {
//         const data = await res.json();
//         console.log("Uploaded file info from server:", data);

//         setMessage("File and data uploaded successfully!");
//         setDoctorName("");
//         setDescription("");
//         setFile(null);
//         setUploadProgress(0);
//         document.getElementById("fileInput").value = "";
//       } else {
//         setMessage("Failed to upload file and data.");
//       }
//     } catch (error) {
//       console.error(error);
//       setMessage("Error uploading file.");
//     }
//   };

//   const categories = [
//     'Prescriptions',
//             'Laboratory Results',
//             'Imaging Results',
//             'Cardiology',
//             'Surgical Reports',
//             'Clinical Notes',
//             'Endoscopy Reports',
//             'Pathology & Cytology',
//             'Vital Signs & Measurements',
//             'Vaccination Records',
//             'Allergy & Sensitivity Tests',
//             'Dermatology Reports',
//             'Neurological Tests',
//             'Pulmonary',
//             'Obstetrics and Gynecology',
//             'Audiology & Vision',
//             'Oncology Reports',
//             'Psychiatric Evaluations'
//   ]

//   return (
//     <div>
//       <h2>Upload File and Info</h2>
//       <form onSubmit={handleSubmit}>
//         <div>
//           <h3 >Doctor’s Name:</h3>
//           <input
//             type="text"
//             value={doctorName}
//             onChange={(e) => setDoctorName(e.target.value)}
//           />
//         </div>
//         <div>
//           <h3>Description:</h3>
//           <textarea
//           placeholder="Text heree.."
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//           />
//         </div>
//         <div>
//           <h3>Category</h3>
//           <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
//           {categories.map((category) => (
//             <option key={category} value="category">{category}</option>
//           ))}
//           </select>
//         </div>
//         <div>
//           <label>Select File:</label>
//           <input type="file" id="fileInput" onChange={handleFileChange} />
//         </div>
//         <button type="submit">Upload</button>
        
//       </form>

//       {uploadProgress > 0 && <p>Upload Progress: {uploadProgress}%</p>}
//       {message && <p>{message}</p>}
//     </div>
//   );
// }
