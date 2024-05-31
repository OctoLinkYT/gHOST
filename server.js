const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8080;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Home route
app.get('/', (req, res) => {
    res.render('index');
});

// Handle folder upload
app.post('/upload', express.raw({ type: 'application/octet-stream', limit: '10mb' }), (req, res) => {
    const files = req.body.toString('utf8');
    const fileList = JSON.parse(files);
    const folderName = fileList.folderName;
    const filesData = fileList.files;

    const uploadPath = path.join(__dirname, 'uploads', folderName);

    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    filesData.forEach(file => {
        const filePath = path.join(uploadPath, file.name);
        fs.writeFileSync(filePath, Buffer.from(file.data, 'base64'));
    });

    res.send('Folder uploaded successfully.');
});

// Dynamic route to serve uploaded sites
app.get('/:siteName', (req, res) => {
    const siteName = req.params.siteName;
    const sitePath = path.join(__dirname, 'uploads', siteName, 'index.html');

    if (fs.existsSync(sitePath)) {
        res.sendFile(sitePath);
    } else {
        res.status(404).send('Site not found');
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
