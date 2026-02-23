const Batch = require('../models/Batch');

exports.createBatch = async (req, res) => {
    try {
        const { batchId, farmer, crop, quantity, grade, location } = req.body;

        // Save in Mongo first
        const batch = await Batch.create({
            batchId,
            cropType: crop,
            quantity,
            grade,
            farmLocation: location,
            status: "CREATED"
        });

        // Try blockchain (optional)
        try {
            const contract = await getContract();
            await contract.submitTransaction(
                'CreateBatch',
                batchId,
                farmer,
                crop,
                quantity.toString(),
                grade,
                location
            );
        } catch (err) {
            console.log("Blockchain failed but Mongo saved");
        }

        res.json({ message: "Batch created", batch });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
