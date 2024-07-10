import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { execSync } from 'child_process';
import { defaultEnvironments, defaultApprovers } from './defaults';

interface Environment {
  name: string;
  reviewers: string[];
}

interface RepositoryConfig {
  name: string;
  environments: Environment[];
}

interface Config {
  repositories: RepositoryConfig[];
}

const configPath = process.argv[2];
const config: Config = yaml.load(fs.readFileSync(configPath, 'utf8')) as Config;

const createOrUpdateEnvironment = (repo: string, environment: Environment) => {
  const reviewersArgs = environment.reviewers.map(reviewer => `--reviewers ${reviewer}`).join(' ');
  const command = `gh api -X PUT /repos/${repo}/environments/${environment.name} ${reviewersArgs}`;
  execSync(command, { stdio: 'inherit' });
};

const main = () => {
  for (const repoConfig of config.repositories) {
    const repo = repoConfig.name;
    const environments = repoConfig.environments.length > 0 ? repoConfig.environments : defaultEnvironments;
    
    for (const environment of environments) {
      const reviewers = environment.reviewers.length > 0 ? environment.reviewers : defaultApprovers;
      createOrUpdateEnvironment(repo, { ...environment, reviewers });
    }
  }
};

main();
