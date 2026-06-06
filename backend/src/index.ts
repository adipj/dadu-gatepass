import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import apiRoutes from './routes';
import 'dotenv/config'

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Gatepass API running on http://localhost:${PORT}`);
});