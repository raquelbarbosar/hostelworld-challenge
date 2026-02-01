import * as dotenv from 'dotenv';

dotenv.config();

export const AppConfig = {
  mongoUrl: process.env.MONGO_URL,
  port: process.env.PORT || 3000,
  musicBrainzUrl: process.env.MUSICBRAINZ_URL,
  userAgent: process.env.USER_AGENT_STRING,
};
