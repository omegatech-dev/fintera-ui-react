import { promises as fs } from 'fs';
import path from 'path';

async function checkMonths(filePath) {
    const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
    const months = data.months;
    if (!months) {
        console.error(`ERROR: No months object in ${filePath}`);
        return false;
    }
    const required = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    let missing = [];
    for (const key of required) {
        if (!months[key]) {
            missing.push(key);
        }
    }
    if (missing.length > 0) {
        console.error(`ERROR: Missing month keys in ${filePath}:`, missing);
        return false;
    }
    console.log(`SUCCESS: All month keys present in ${filePath}`);
    return true;
}

async function run() {
    const enPath = path.join(process.cwd(), 'src/locales/en.json');
    const esPath = path.join(process.cwd(), 'src/locales/es.json');

    const [enOk, esOk] = await Promise.all([
        checkMonths(enPath),
        checkMonths(esPath)
    ]);

    if (enOk && esOk) {
        console.log('All month translations are present.');
        process.exit(0);
    } else {
        process.exit(1);
    }
}

run();
