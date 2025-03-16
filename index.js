const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/calculate-risk', (req, res) => {
    console.log('Received risk calculation request');

    if (!req.body || !req.body.age || !req.body.height || !req.body.weight || 
        !req.body.systolic || !req.body.diastolic) {
        return res.status(400).json({ error: "Missing required parameters" });
    }

    try {

        const age = parseInt(req.body.age);
        const height = parseFloat(req.body.height) / 100; 
        const weight = parseFloat(req.body.weight);
        const systolic = parseInt(req.body.systolic);
        const diastolic = parseInt(req.body.diastolic);
        const familyHistory = Array.isArray(req.body.familyHistory) ? req.body.familyHistory : [];

        const bmi = calculateBMI(height, weight);
        const bmiCategory = getBMICategory(bmi);
        const bmiPoints = getBMIPoints(bmiCategory);
        
        const bpCategory = getBPCategory(systolic, diastolic);
        const bpPoints = getBPPoints(bpCategory);
 
        const agePoints = getAgePoints(age);

        const familyPoints = getFamilyHistoryPoints(familyHistory);
        

        const totalScore = agePoints + bmiPoints + bpPoints + familyPoints;
        
        const riskCategory = getRiskCategory(totalScore);
        
        res.status(200).json({
            age,
            bmi,
            bmiCategory,
            bmiPoints,
            systolic,
            diastolic,
            bpCategory,
            bpPoints,
            agePoints,
            familyHistory,
            familyPoints,
            totalScore,
            riskCategory
        });
        
    } catch (error) {
        console.error('Error in risk calculation:', error);
        res.status(500).json({ error: "An error occurred while calculating risk" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


function calculateBMI(heightInMeters, weightInKg) {
    return weightInKg / (heightInMeters * heightInMeters);
}

function getBMICategory(bmi) {
    if (bmi < 18.5) {
        return "Underweight";
    } else if (bmi < 25) {
        return "Normal";
    } else if (bmi < 30) {
        return "Overweight";
    } else {
        return "Obese";
    }
}

function getBMIPoints(bmiCategory) {
    switch (bmiCategory) {
        case "Normal":
            return 0;
        case "Overweight":
            return 30;
        default:
            return 75;
    }
}

function getBPCategory(systolic, diastolic) {
    if (systolic >= 180 || diastolic >= 120) {
        return "Crisis";
    } else if (systolic >= 140 || diastolic >= 90) {
        return "Stage 2";
    } else if (systolic >= 130 || diastolic >= 80) {
        return "Stage 1";
    } else if (systolic >= 120 || diastolic >= 80) {
        return "Elevated";
    } else {
        return "Normal";
    }
}

function getBPPoints(bpCategory) {
    switch (bpCategory) {
        case "Normal":
            return 0;
        case "Elevated":
            return 15;
        case "Stage 1":
            return 30;
        case "Stage 2":
            return 75;
        case "Crisis":
            return 100;
        default:
            return 0;
    }
}

function getAgePoints(age) {
    if (age < 30) {
        return 0;
    } else if (age < 45) {
        return 10;
    } else if (age < 60) {
        return 20;
    } else {
        return 30;
    }
}

function getFamilyHistoryPoints(familyHistory) {
    let points = 0;
    
    if (familyHistory.includes("diabetes")) {
        points += 10;
    }
    
    if (familyHistory.includes("cancer")) {
        points += 10;
    }
    
    if (familyHistory.includes("alzheimers")) {
        points += 10;
    }
    
    return points;
}


function getRiskCategory(totalScore) {
    if (totalScore <= 20) {
        return "Low Risk";
    } else if (totalScore <= 50) {
        return "Moderate Risk";
    } else if (totalScore <= 75) {
        return "High Risk";
    } else {
        return "Uninsurable";
    }
}