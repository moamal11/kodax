const {withAppBuildGradle}=require('expo/config-plugins');

// Non-clean prebuild can retain Google's production Gradle plugin even when the
// preview config omits googleServicesFile. The preview is intentionally a separate
// application; never rewrite the production Firebase file or its registered IDs.
module.exports=config=>withAppBuildGradle(config,cfg=>{
  if(cfg.extra?.androidReview===true){
    cfg.modResults.contents=cfg.modResults.contents.replace(/^\s*apply plugin:\s*['"]com\.google\.gms\.google-services['"]\s*$/gm,'');
  }
  return cfg;
});
