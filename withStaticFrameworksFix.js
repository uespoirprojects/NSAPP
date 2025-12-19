const { withXcodeProject } = require('@expo/config-plugins');

const withStaticFrameworksFix = (config) => {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const configurations = xcodeProject.pbxXCBuildConfigurationSection();
    
    for (const key in configurations) {
      const buildSettings = configurations[key].buildSettings;
      if (buildSettings) {
        // This tells Xcode to allow headers that aren't strictly modular
        // fixing the specific -Wnon-modular-include error
        buildSettings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES';
      }
    }
    return config;
  });
};

module.exports = withStaticFrameworksFix;