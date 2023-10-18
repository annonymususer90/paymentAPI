const express = require('express');
const axios = require('axios');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 5500;

const merchants = new Map();
const isActive = {
    name: null,
    key: null
};


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'merchant.html');
    res.sendFile(filePath);
});
app.post('/create_order', async (req, res) => {
    try {
        if (!isActive.name || merchants.size === 0) {
            return res.status(500).send('internal server error');
        }

        const {
            client_txn_id,
            amount,
        } = req.body;

        if (!client_txn_id || !amount) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const payload = {
            key: isActive.key,
            client_txn_id: client_txn_id,
            amount: amount,
            p_info: 'abc',
            customer_name: 'abc',
            customer_email: 'abc@gmail.com',
            customer_mobile: "1234567890",
            redirect_url: 'https://google.com'
        };

        const response = await axios.post('https://api.ekqr.in/api/create_order', payload);

        const modifiedResponse = {
            status: response.data.status,
            msg: response.data.msg,
            data: {
                order_id: response.data.data.order_id,
                payment_url: response.data.data.payment_url
            }
        };

        res.status(response.status).json(modifiedResponse);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/webhook', (req, res) => {
    const {
        amount,
        client_txn_id,
        createdAt,
        customer_email,
        customer_mobile,
        customer_name,
        customer_vpa,
        id,
        p_info,
        redirect_url,
        remark,
        status,
        txnAt,
        udf1,
        udf2,
        udf3,
        upi_txn_id,
    } = req.body;


    // console.log('Received webhook data:');
    // console.log('Amount:', amount);
    // console.log('Client Transaction ID:', client_txn_id);
    // console.log('Created At:', createdAt);
    // console.log('Customer Email:', customer_email);
    // console.log('Customer Mobile:', customer_mobile);
    // console.log('Customer Name:', customer_name);
    // console.log('Customer VPA:', customer_vpa);
    // console.log('Order ID (UPI Gateway):', id);
    // console.log('P Info:', p_info);
    // console.log('Redirect URL:', redirect_url);
    // console.log('Remark:', remark);
    // console.log('Status:', status);
    // console.log('Transaction Date:', txnAt);
    // console.log('UDF1:', udf1);
    // console.log('UDF2:', udf2);
    // console.log('UDF3:', udf3);
    // console.log('UPI Transaction ID:', upi_txn_id);


    res.status(200).send();
});

app.post('/add_merchant', (req, res) => {
    const { name, key } = req.body;
    if (!isActive.name) {
        isActive.name = name;
        isActive.key = key;
    }

    merchants.set(name, { name: name, key: key });

    res.status(200).send();
});

app.post('/activate_merchant', (req, res) => {
    const { name } = req.body;

    if (!merchants.has(name)) return res.status(400).send('no such merchant');

    const merchant = merchants.get(name);
    isActive.name = merchant.name;
    isActive.key = merchant.key;

    return res.status(200).send(isActive.name + ' enabled');
});

app.get('/get_merchants', (req, res) => {
    if (merchants.size === 0) return res.status(400).json([]);

    let data = [];
    merchants.forEach((merchant) => {
        data.push({ name: merchant.name, key: merchant.key, status: (isActive.name === merchant.name) });
    });

    res.status(200).json(data);
});

app.post('/remove_merchant', (req, res) => {
    const { name } = req.body;

    merchants.delete(name);

    res.status(200);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

