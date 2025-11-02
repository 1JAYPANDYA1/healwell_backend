import { translate } from '@vitalets/google-translate-api';

// Function to translate text
async function translateText(text) {
    try {
        const result = await translate(text, { to: 'es' });
        console.log(`Original text: ${text}`);
        console.log(`Translated text: ${result.text}`);
        return result.text;
    } catch (error) {
        console.error('Translation error:', error.message);
        throw error;
    }
}

// Function to translate multiple texts
async function translateBatch(texts) {
    try {
        const translations = await Promise.all(
            texts.map(text => translate(text, { to: 'gu' }))
        );
        
        texts.forEach((text, index) => {
            console.log(`\nOriginal: ${text}`);
            console.log(`Translated: ${translations[index].text}`);
        });
        
        return translations.map(t => t.text);
    } catch (error) {
        console.error('Batch translation error:', error.message);
        throw error;
    }
}

// Example usage
const sampleTexts = [
    'Hello, how are you?',
    'The weather is nice today',
    'I love programming'
];

// Using the translation functions
async function runExample() {
    try {
        // Single text translation
        console.log('Single Translation:');
        await translateText('Hello world');

        // Batch translation
        console.log('\nBatch Translation:');
        await translateBatch(sampleTexts);
    } catch (error) {
        console.error('Example error:', error);
    }
}

runExample();