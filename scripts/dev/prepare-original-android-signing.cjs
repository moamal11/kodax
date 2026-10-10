/** Read existing EAS credentials only. Never create/rotate keys or print secrets. */
const fs = require('node:fs');
const path = require('node:path');
const cli = 'C:/nvm4w/nodejs/node_modules/eas-cli/build';
const SessionManager = require(path.join(cli, 'user/SessionManager')).default;
const { createGraphqlClient } = require(path.join(cli, 'commandUtils/context/contextUtils/createGraphqlClient'));
const { AppVersionQuery } = require(path.join(cli, 'graphql/queries/AppVersionQuery'));
(async () => {
  const session = new SessionManager({ setActor() {} });
  const { actor, authenticationInfo } = await session.ensureLoggedInAsync({ nonInteractive: true });
  if (actor.username !== 'mo_nz') throw new Error('Unexpected EAS account');
  const client = createGraphqlClient(authenticationInfo);
  const { data, error } = await client.query(`query OriginalAndroidSigning {
    app { byFullName(fullName: "@mo_nz/kodax") {
      id androidAppCredentials(filter: { applicationIdentifier: "com.kodax.app", legacyOnly: false }) {
        applicationIdentifier googleServiceAccountKeyForFcmV1 { id } androidAppBuildCredentialsList {
          name isDefault androidKeystore { keystore keystorePassword keyAlias keyPassword sha256CertificateFingerprint }
        }
      }
    } }
  }`, {}).toPromise();
  if (error) throw new Error('Could not read existing Android signing credentials');
  const app = data?.app?.byFullName;
  if (app?.id !== '0f11f7e3-6a89-4669-9d31-96cc6881129e') throw new Error('Unexpected EAS project');
  const builds = app.androidAppCredentials.flatMap(c => c.androidAppBuildCredentialsList);
  const selected = builds.find(b => b.isDefault && b.androidKeystore) || (builds.length === 1 ? builds[0] : null);
  if (!selected?.androidKeystore) throw new Error('No unambiguous existing release keystore');
  const version = await AppVersionQuery.latestVersionAsync(client, app.id, 'ANDROID', 'com.kodax.app');
  const currentCode = Number(version?.buildVersion || 1);
  const k = selected.androidKeystore;
  const keystorePath = path.resolve('android/app/kodax-original-release.jks');
  fs.writeFileSync(keystorePath, Buffer.from(k.keystore, 'base64'));
  const privateConfig = { keystorePath, storePassword: k.keystorePassword, keyAlias: k.keyAlias, keyPassword: k.keyPassword || k.keystorePassword,
    certificateSha256: k.sha256CertificateFingerprint, source: 'existing default EAS Android keystore',
    versionCode: currentCode + 1, remoteVersionCode: currentCode, version: '1.2.0' };
  fs.writeFileSync('.env.android-signing.local', JSON.stringify(privateConfig, null, 2));
  const metadata = { project: '@mo_nz/kodax', package: 'com.kodax.app', credential: selected.name,
    certificateSha256: privateConfig.certificateSha256, remoteVersionCode: currentCode, localApkVersionCode: privateConfig.versionCode,
    easFcmV1CredentialPresent: app.androidAppCredentials.some(c => !!c.googleServiceAccountKeyForFcmV1),
    remoteMutations: 0, secretsPrinted: false };
  fs.mkdirSync('reports/android-original-20261010', { recursive: true });
  fs.writeFileSync('reports/android-original-20261010/signing-source.json', JSON.stringify(metadata, null, 2));
  console.log(JSON.stringify(metadata, null, 2));
})().catch(() => { console.error('Unable to prepare existing Android signing credentials; no keys were modified.'); process.exitCode = 1; });
