const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const PORT = 3000;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
            cb(null, 'recordings/');
                },
                    filename: (req, file, cb) => {
                            cb(null, file.originalname);
                                }
                                });
                                const upload = multer({ storage: storage });

                                app.use(express.static(path.join(__dirname, 'public')));

                                // Endpoint to handle file upload and conversion
                                app.post('/upload', upload.single('audio'), (req, res) => {
                                    const format = req.body.format;
                                        const inputFilePath = req.file.path;
                                            const outputFilePath = `recordings/output.${format}`;

                                                ffmpeg(inputFilePath)
                                                        .toFormat(format)
                                                                .on('end', () => {
                                                                            fs.unlinkSync(inputFilePath); // Remove original file
                                                                                        res.download(outputFilePath, () => {
                                                                                                        fs.unlinkSync(outputFilePath); // Remove converted file after download
                                                                                                                    });
                                                                                                                            })
                                                                                                                                    .on('error', (err) => {
                                                                                                                                                console.error(err);
                                                                                                                                                            res.status(500).send('Conversion error');
                                                                                                                                                                    })
                                                                                                                                                                            .save(outputFilePath);
                                                                                                                                                                            });

                                                                                                                                                                            app.listen(PORT, () => {
                                                                                                                                                                                console.log(`Server is running on http://localhost:${PORT}`);
                                                                                                                                                                                });
                                                                                                                                                                                