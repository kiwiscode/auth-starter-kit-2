const app = require("./app");
const { PORT } = require("./constants/env");

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
