exports.getProvenance = async (req, res) => {
    try {
        const batch = await Batch.findOne({ batchId: req.params.id });

        if (!batch) {
            return res.status(404).json({ error: "Batch not found" });
        }

        res.json({
            ProvenanceCard: {
                Origin: {
                    FarmLocation: batch.farmLocation,
                    Crop: batch.cropType
                },
                Production: {
                    Quantity: batch.quantity + " kg",
                    Grade: batch.grade
                },
                CurrentStatus: batch.status,
                BlockchainVerified: false // until Fabric active
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
