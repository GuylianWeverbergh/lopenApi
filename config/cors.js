// Customize CORS options

const corsConfig = {
    origin: '*', // Replace with the actual domain of your frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  };

module.exports = corsConfig;
