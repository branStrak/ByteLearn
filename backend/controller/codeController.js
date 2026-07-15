const axios = require('axios');

const executeCode = async (req, res) => {
    try {
        const { source_code, language_id } = req.body;

        const response = await axios.post(
            'https://ce.judge0.com/submissions?base64_encoded=false&wait=true',
            { source_code, language_id },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.stdout) {
            return res.status(200).json({ output: response.data.stdout });
        }

        if (response.data.compile_output) {
            return res.status(400).json({ error: response.data.compile_output });
        }

        if (response.data.stderr) {
            return res.status(400).json({ error: response.data.stderr });
        }

        // Default empty response
        return res.status(200).json({ output: '' });
    } catch (error) {
        console.error('Code execution error:', error.message);
        res.status(500).json({ error: 'Server error during code execution' });
    }
};

module.exports = { executeCode };
