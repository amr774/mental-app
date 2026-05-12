require("dotenv").config();
const cors = require("cors");
const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 3000;
app.use(cors());

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} 🚀`);
    });
});
