// Wraps app.json so CI can deploy the same app twice (once per study arm)
// under different subpaths. EXPO_BASE_URL overrides experiments.baseUrl;
// local dev and app.json defaults are unchanged when it is not set.
module.exports = ({ config }) => {
  if (process.env.EXPO_BASE_URL) {
    config.experiments = { ...config.experiments, baseUrl: process.env.EXPO_BASE_URL };
  }
  return config;
};
