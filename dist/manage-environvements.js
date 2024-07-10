"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const yaml = require("js-yaml");
const child_process_1 = require("child_process");
const defaults_1 = require("./defaults");
const configPath = process.argv[2];
const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
const createOrUpdateEnvironment = (repo, environment) => {
    const reviewersArgs = environment.reviewers.map(reviewer => `--reviewers ${reviewer}`).join(' ');
    const command = `gh api -X PUT /repos/${repo}/environments/${environment.name} ${reviewersArgs}`;
    (0, child_process_1.execSync)(command, { stdio: 'inherit' });
};
const main = () => {
    for (const repoConfig of config.repositories) {
        const repo = repoConfig.name;
        const environments = repoConfig.environments.length > 0 ? repoConfig.environments : defaults_1.defaultEnvironments;
        for (const environment of environments) {
            const reviewers = environment.reviewers.length > 0 ? environment.reviewers : defaults_1.defaultApprovers;
            createOrUpdateEnvironment(repo, Object.assign(Object.assign({}, environment), { reviewers }));
        }
    }
};
main();
