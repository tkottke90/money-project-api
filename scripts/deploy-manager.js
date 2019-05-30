/* eslint-disable no-console */
const fs = require('fs');
const chalk = require('chalk');
const min = require('minimist')(process.argv.slice(2));
const { spawn } = require('child_process');

const validCommands = ['major', 'minor', 'revision'];

/**
 * Version Manager holds the functions that tell the script how to manipulate the version
 */
const versionManager = {
  major: (version) => {
    version[0]++;
    version[1] = 0;
    version[2] = 0;
    return version;
  },
  minor: (version) => {
    version[1]++;
    version[2] = 0;
    return version;
  }, 
  revision: (version) => {
    version[2]++;
    return version;
  }
};

function logChange(original) {
  return updated => {
    return `${new Date().toISOString()} - Update App Version ${original} => ${updated}`;
  };
}

function deploy(packageName, version) {
  return () => {
    // Execute Docker Build
    const tagName = min['t'] ? min['t'] : __dirname ;
    const command = `docker build -t ${tagName}:${version} ${ min['l'] ? `-t ${tagName}:latest` : ''}`;

    let commands = [ 
      'build',
      '-t',
      `${tagName}:${version}`,
    ];

    if (min['l']) {
      commands = [ ...commands, '-t', `${tagName}:latest`];
    }

    console.log('Command: ', command);
    const dockerChild = spawn('docker', [...commands, '.']);

    dockerChild.stdout.on('data', (data) => {
      console.log(chalk.hex('#ff9900')(data));
    });

    dockerChild.stderr.on('data', (data) => {
      console.error(`docker build error: \n${data}`);
    });
  };
}

let deployState;
 
if (process.argv.length === 2) {
  console.log(`Usage: ${chalk.green('node deploy-manager.js')} [major | minor | revision] [OPTIONS]`);
  console.log(`
    -t    Image tag to be given [default = name in package.json]
    -l    Add latest tag to image [default = true]
  `);
  process.exit(1);
}

// Check if user entered a valid command (major, minor, or revision)
if (!validCommands.includes(process.argv[2]) ) {
  console.error(chalk.red(`Invalid Argument! - '${process.argv[2]}'`));
  console.log('Usage: node npm-version.js [major | minor | revision] [OPTIONS]');
  process.exit(1);
}

if (min['l'] === undefined) {
  min['l'] = true;
}

// Get Current Version
if (fs.existsSync('./package.json')) {
  // Get Version Number from package.json
  const packageJSON = fs.readFileSync('./package.json');
  const body = JSON.parse(packageJSON);

  // Convert string to arr of numbers
  const version = body.version.split('.').map( num => +num);
  const log = logChange(body.version);

  // Update version based on user input
  body.version = versionManager[process.argv[2]](version).join('.');

  fs.writeFileSync('./package.json', JSON.stringify(body, null, 2), 'utf8');

  console.log(chalk.blue(log(body.version)));

  deployState = deploy(body.name, body.version);

} else {
  console.error(chalk.red(`Missing package.json at ${process.cwd()}!`));
  process.exit(1);
}

deployState();