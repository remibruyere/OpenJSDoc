#!/usr/bin/env node

import path from 'path';
import { main } from '../src';

const CONFIGURATION_FILE_NAME = 'openjsdoc.config.json';

const configPath = path.resolve(process.cwd(), CONFIGURATION_FILE_NAME);

main(configPath);
