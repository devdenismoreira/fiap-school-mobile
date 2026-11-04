const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const SRC_ALIAS = '@/';
const srcDir = path.resolve(__dirname, 'src');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Alias `@/` → `src/` (o mesmo de tsconfig.json e jest.config.js).
    // Nenhum pacote do npm começa com "@/", então não há colisão.
    resolveRequest: (context, moduleName, platform) =>
      context.resolveRequest(
        context,
        moduleName.startsWith(SRC_ALIAS)
          ? path.join(srcDir, moduleName.slice(SRC_ALIAS.length))
          : moduleName,
        platform,
      ),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
