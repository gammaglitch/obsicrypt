// Bump the plugin version across package.json, public/manifest.json, and
// versions.json. Usage: `pnpm run bump <major.minor.patch>`
//
// versions.json maps each plugin version to the minAppVersion it requires, so
// Obsidian can pick a compatible release for older apps. We append the new
// version pointing at the manifest's current minAppVersion.

import { readFileSync, writeFileSync } from 'node:fs';

const version = process.argv[2];
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
	console.error('Usage: pnpm run bump <major.minor.patch>  (e.g. 0.2.0)');
	process.exit(1);
}

const PKG = 'package.json';
const MANIFEST = 'public/manifest.json';
const VERSIONS = 'versions.json';

const pkg = JSON.parse(readFileSync(PKG, 'utf8'));
pkg.version = version;
writeFileSync(PKG, JSON.stringify(pkg, null, '\t') + '\n');

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
manifest.version = version;
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 4) + '\n');

const versions = JSON.parse(readFileSync(VERSIONS, 'utf8'));
versions[version] = manifest.minAppVersion;
writeFileSync(VERSIONS, JSON.stringify(versions, null, '\t') + '\n');

console.log(`Bumped to ${version} (minAppVersion ${manifest.minAppVersion}).`);
console.log('Next:');
console.log(`  git commit -am "release: ${version}"`);
console.log(`  git push origin main`);
console.log(`  git tag ${version} && git push origin ${version}   # no "v" prefix`);
