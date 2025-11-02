import express from 'express'
import { getAppointmentsByPatient, updatePatientProfile, getPrescriptionsByPatient, getDoctorsBySpecialization,createAppointment,getDoctorList,getDoctorInfo,getDoctorSchedule  } from '../controllers/patientController.js';
import {verifyAccessToken} from '../utils/tokenUtils.js'
import translate from 'google-translate-api-x';
const router = express.Router();

router.get("/getAppointments",verifyAccessToken ,getAppointmentsByPatient );
router.post("/updatePatientprofile",verifyAccessToken ,updatePatientProfile );
router.get("/getpriscription",verifyAccessToken ,getPrescriptionsByPatient);
router.get("/doctors-by-category", verifyAccessToken,getDoctorsBySpecialization);
router.get("/doctorlist", verifyAccessToken,getDoctorList);
router.get("/doctorinfo/:doctorId", verifyAccessToken,getDoctorInfo);
router.post("/book-appointment",verifyAccessToken, createAppointment);
router.post("/get-schedule",verifyAccessToken ,getDoctorSchedule);
const translationCache = new Map();

const createCacheKey = (text, targetLang) => `${text}-${targetLang}`;

router.post('/translate', async (req, res) => {
    try {
        const { text, targetLang } = req.body;

        if (!text || !targetLang) {
            return res.status(400).json({ 
                error: 'Missing required fields: text and targetLang' 
            });
        }

        const cacheKey = createCacheKey(text, targetLang);
        if (translationCache.has(cacheKey)) {
            return res.json({
                translatedText: translationCache.get(cacheKey),
                from: 'en',
                to: targetLang,
                cached: true
            });
        }

        let retries = 3;
        let translatedText = null;
        let error = null;

        while (retries > 0 && !translatedText) {
            try {
                const result = await translate(text, {
                    to: targetLang,
                    client: 'gtx' 
                });
                translatedText = result.text;
                
                translationCache.set(cacheKey, translatedText);
                
                if (translationCache.size > 1000) {
                    const oldestKey = translationCache.keys().next().value;
                    translationCache.delete(oldestKey);
                }
            } catch (e) {
                error = e;
                retries--;
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        if (!translatedText) {
            throw error || new Error('Translation failed after multiple attempts');
        }

        res.json({
            translatedText,
            from: 'en',
            to: targetLang,
            cached: false
        });

    } catch (error) {
        console.error('Translation error:', error);
        res.status(429).json({ 
            error: 'Translation service temporarily unavailable. Please try again later.',
            details: error.message 
        });
    }
});
export default router;