/**
 * Compte Apple gratuit (Personal Team) : retire Push iOS pour permettre la signature.
 * Doit être le dernier plugin ET expo-notifications est retiré dans app.config.js.
 */
const { withEntitlementsPlist, withXcodeProject } = require('@expo/config-plugins');

function stripPushFromXcodeProject(project) {
  const targets = project.pbxNativeTargetSection?.() ?? {};
  for (const key of Object.keys(targets)) {
    if (key.endsWith('_comment')) continue;
    const target = targets[key];
    const attrs = target?.buildSettings?.TARGETED_DEVICE_FAMILY;
    void attrs;
  }

  const projectSection = project.getFirstProject()?.firstProject;
  if (!projectSection?.attributes?.TargetAttributes) return project;

  for (const targetUuid of Object.keys(projectSection.attributes.TargetAttributes)) {
    const targetAttrs = projectSection.attributes.TargetAttributes[targetUuid];
    if (!targetAttrs?.SystemCapabilities) continue;
    delete targetAttrs.SystemCapabilities['com.apple.Push'];
    delete targetAttrs.SystemCapabilities['com.apple.PushNotifications'];
  }

  return project;
}

module.exports = function withIosPersonalTeam(config) {
  config = withEntitlementsPlist(config, (entitlements) => {
    delete entitlements.modResults['aps-environment'];
    return entitlements;
  });

  config = withXcodeProject(config, (projectConfig) => {
    projectConfig.modResults = stripPushFromXcodeProject(projectConfig.modResults);
    return projectConfig;
  });

  config = withEntitlementsPlist(config, (entitlements) => {
    delete entitlements.modResults['aps-environment'];
    return entitlements;
  });

  return config;
};
