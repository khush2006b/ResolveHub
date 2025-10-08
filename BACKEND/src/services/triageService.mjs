// src/services/triageService.mjs

/**
 * CONTRACT for ML Team: Simulates the AI's determination of category and staff assignment.
 * NOTE: The 'assignedToId' field has been temporarily commented out of the return 
 * value but is present as a local constant for quick re-integration.
 */

// --- ESM PATH SETUP (REQUIRED to resolve local paths) ---
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --------------------------------------------------------

import * as tf from '@tensorflow/tfjs';
import * as tfn from '@tensorflow/tfjs-node';
import * as fs from 'fs';
import axios from 'axios'; 

const IMG_WIDTH = 128;
const IMG_HEIGHT = 128;

// --- GLOBAL MODEL/LABEL VARIABLES ---
let mobilenetModel = null;
let classificationModel = null;
let labels = [];

/**
 * Pre-loads the models and labels into memory. Call this once when the server starts.
 */
export const loadModels = async () => {
    try {
        // --- 1. Load Labels ---
        // 'labels.json' is assumed to be in the same directory (/src/services) based on the file structure image.
        const labelsPath = path.join(__dirname, 'labels.json'); 
        
        // ⚠️ IMPORTANT: If labels.json is in /BACKEND/, use: 
        // const labelsPath = path.join(__dirname, '..', 'labels.json');
        
        labels = JSON.parse(fs.readFileSync(labelsPath, 'utf-8'));
        console.log('ML Service: Labels loaded successfully from:', labelsPath);

        // --- 2. Load BOTH Models ---
        // The big pre-trained base model (MobileNetV2) is fetched from the running server (port 3000)
        mobilenetModel = await tf.loadGraphModel('http://localhost:3000/model/model.json');
        console.log('ML Service: Base MobileNetV2 model loaded.');

        // Load your small, trained classification head
        const classificationModelPath = tfn.io.fileSystem(path.join(__dirname, 'my_model', 'model.json'));
        classificationModel = await tf.loadLayersModel(classificationModelPath);
        console.log('ML Service: Custom classification model loaded.');

    } catch (error) {
        // Re-throw the error as a critical failure after logging
        console.error('CRITICAL ERROR: Failed to load ML models or labels. Check server status (port 3000) and file paths:', error.message);
        throw new Error(`Failed to initialize ML models: ${error.message}`);
    }
};


// Function to download an image from a URL and preprocess it
const loadRemoteImage = async (url) => {
    if (!url) return null;

    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);

        let tensor = tfn.node.decodeImage(buffer, 3);
        
        return tensor.resizeNearestNeighbor([IMG_HEIGHT, IMG_WIDTH])
                     .toFloat()
                     .div(tf.scalar(255.0))
                     .expandDims();
    } catch (error) {
        console.error(`Error loading image from URL ${url}: ${error.message}`);
        return null;
    }
};


/**
 * Main function to predict the category based on input images.
 * @param {string[]} mediaUrls - Array of Cloudinary image URLs.
 * @param {string} description - Text description.
 * @returns {Promise<{category: string, confidence: number, assignedToId: string}>}
 */
export const runTriageandAssign = async (mediaUrls, description) => {
    if (!mobilenetModel || !classificationModel || labels.length === 0) {
        throw new Error("ML Models are not yet loaded. Please call loadModels() first.");
    }
    
    // Placeholder assignment logic:
    const ASSIGNED_STAFF_ID = '60c72b2f9011e00015b8b982'; 
    
    const urlsToProcess = mediaUrls.slice(0, 5); 
    let aggregatedPredictions = {};

    console.log(`Starting triage for ${urlsToProcess.length} images...`);

    // --- 1. Process all available images ---
    for (const url of urlsToProcess) {
        const imageTensor = await loadRemoteImage(url);

        if (imageTensor) {
            const embeddings = mobilenetModel.predict(imageTensor);
            const prediction = classificationModel.predict(embeddings); 
            const scores = await prediction.data();
            const predictedIndex = prediction.as1D().argMax().dataSync()[0];
            
            const predictedLabel = labels[predictedIndex];
            const confidence = scores[predictedIndex];
            
            aggregatedPredictions[predictedLabel] = (aggregatedPredictions[predictedLabel] || 0) + confidence;
            
            // Clean up tensors
            tf.dispose([imageTensor, embeddings, prediction]);
        }
    }
    
    // --- 2. Determine Final Category ---
    let finalCategory = 'Uncategorized';
    let maxScore = -1;
    let totalScore = Object.values(aggregatedPredictions).reduce((a, b) => a + b, 0);

    for (const label in aggregatedPredictions) {
        if (aggregatedPredictions[label] > maxScore) {
            maxScore = aggregatedPredictions[label];
            finalCategory = label;
        }
    }
    
    const finalConfidence = totalScore > 0 ? (maxScore / totalScore) * 100 : 0;
    
    console.log(`Triage Complete. Final Category: ${finalCategory} (${finalConfidence.toFixed(2)}%)`);

    return {
        category: finalCategory,
        confidence: parseFloat(finalConfidence.toFixed(2)),
        // assignedToId: ASSIGNED_STAFF_ID, // Uncomment when integrating with your complaint controller
    };
};


// --- SELF-EXECUTING TEST FUNCTION ---
const testTriageService = async () => {
    try {
        // 1. Call loadModels() to load the AI models first
        await loadModels();

        // 2. Define your test data
        const testImageUrls = [
            'https://res.cloudinary.com/dffrtqlgz/image/upload/v1759913861/khush_ki_bakchodi_i2mw8m.jpg',
            'https://res.cloudinary.com/dffrtqlgz/image/upload/v1759913894/puja_mishra_mdfsx6.jpg'
        ];
        const testDescription = "Potholes and broken street lights on Elm Street.";

        console.log('\n=======================================');
        console.log('🤖 STARTING LIVE PREDICTION TEST');
        console.log('=======================================');

        const result = await runTriageandAssign(testImageUrls, testDescription);

        console.log('\n✅ TEST SUCCESSFUL - Triage Result:');
        console.log(JSON.stringify(result, null, 4));
        console.log('=======================================\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED - Critical Error in Triage:', error.message);
        console.log('=======================================\n');
    }
    
    // Clean up TensorFlow memory after the test
    tf.disposeVariables(); 
};

// Execute the test function when the script runs
testTriageService();