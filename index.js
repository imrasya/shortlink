const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const os = require('os')
const bytes = require('bytes');

if (process.env.NODE_ENV) {
    require('dotenv').config({
        path: `${__dirname}/.env.${process.env.NODE_ENV}`
    })
} else  {
    require('dotenv').config()
}

const app = express();

var baseurl

mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

const urlSchema = new mongoose.Schema({
    originalUrl: String,
    shortUrl: String,
    shortCode: String
});

const Url = mongoose.model('Url', urlSchema);

const saveToMongoDB = async (originalUrl, shortUrl, shortCode) => {
    try {
        const newUrl = new Url({
            originalUrl,
            shortUrl,
            shortCode
        });

        await newUrl.save();
        console.log('Data saved to MongoDB successfully');
    } catch (error) {
        console.error('Failed to save data to MongoDB:', error.message);
    }
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('json spaces', 4);

app.use((req, res, next) => {
    const time = new Date().toLocaleString('id', { timeZone: 'Asia/Jakarta' });
    console.log(`[${time}] ${req.method}: ${req.url}`);
    next();
});

app.use((req, res, next) => {
    baseurl = req.get('host');
    console.log('Current URL:', baseurl);
    next();
  });

app.get('/', async (req, res) => {
	const obj = {}
	const used = process.memoryUsage()
    const urls = await Url.find({}, 'shortUrl originalUrl shortCode');
	for (let key in used) obj[key] = formatSize(used[key])
	
	const totalmem = os.totalmem()
	const freemem = os.freemem()
	obj.memoryUsage = `${formatSize(totalmem - freemem)} / ${formatSize(totalmem)}`
	
	res.json({
		creator: 'rasya',
		message: 'Hello World',
		uptime: new Date(process.uptime() * 1000).toUTCString().split(' ')[4],
		status: obj,
        listshort: urls
	})
});

app.get('/:shortCode', async (req, res) => {
    const { shortCode } = req.params;
    const url = await Url.findOne({ shortUrl: `https://${baseurl}/${shortCode}`});
    if (url) {
        res.redirect(url.originalUrl);
    } else {
        res.status(404).json({ error: 'URL not found' });
    }
});

app.post('/shorten', async (req, res) => {
    const { originalUrl } = req.body;
    const shortCode = shortid.generate();
    const shortUrl = `https://${baseurl}/${shortCode}`;
    try {
        await saveToMongoDB(originalUrl, shortUrl, shortCode);
        res.json({ shortUrl });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create short link' });
    }
});

app.delete('/:shortCode', async (req, res) => {
    const { shortCode } = req.params;
    try {
        const urlToDelete = await Url.findOne({ shortUrl: `https://${baseurl}/${shortCode}`});
        // console.log(urlToDelete);
        if (!urlToDelete) return res.status(404).json({ error: 'Short link not found' });

        Url.deleteOne({ shortUrl: `https://${baseurl}/${shortCode}`, shortCode, shortUrl: urlToDelete.shortUrl, originalUrl: urlToDelete.originalUrl, _id: urlToDelete._id}).then(data => {
            console.log(data);
        });

        res.json({ message: 'Short link deleted successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Failed to delete short link', msg: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

function formatSize(num) {
	return bytes.format(+num || 0, { unitSeparator: ' ' })
}