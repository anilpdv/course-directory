const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configure path alias resolution
config.resolver.extraNodeModules = {
  '@shared': path.resolve(__dirname, 'src/shared'),
  '@features': path.resolve(__dirname, 'src/features'),
};

// Watch the src directory for changes
config.watchFolders = [path.resolve(__dirname, 'src')];

module.exports = config;
