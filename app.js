const express = require('express');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(express.json());

app.post('/create_order', async (req, res) => {
    try {
        const {
            key,
            client_txn_id,
            amount,
            p_info,
            customer_name,
            customer_email,
            customer_mobile,
            redirect_url
        } = req.body;

        if (!key || !client_txn_id || !amount || !p_info || !customer_name || !customer_email || !customer_mobile || !redirect_url) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const payload = {
            key,
            client_txn_id,
            amount,
            p_info,
            customer_name,
            customer_email,
            customer_mobile,
            redirect_url
        };

        const response = await axios.post('https://api.ekqr.in/api/create_order', payload);

        const modifiedResponse = {
            status: response.data.status,
            msg: response.data.msg,
            data: {
                order_id: response.data.data.order_id
            }
        };

        res.status(response.status).json(modifiedResponse);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/check_order_status', async (req, res) => {
    try {

        const { key, client_txn_id, txn_date } = req.body;


        if (!key || !client_txn_id || !txn_date) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }


        const payload = {
            key,
            client_txn_id,
            txn_date
        };


        const response = await axios.post('https://api.ekqr.in/api/check_order_status', payload);


        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
