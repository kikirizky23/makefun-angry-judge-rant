// A short, furious rant about a neighbour and his leaf blower.
//
// The joke is a ritual that never works. Every Saturday at 7am the
// neighbour drags out his leaf blower to shift three leaves from his
// driveway onto mine. Six years of this, the same three leaves, and
// they have never once actually gone anywhere. So the rant reframes
// the chore: he is not cleaning, he is watering leaves with noise.
// The last line widens it to the whole street, everyone lying awake
// pretending Saturday morning is still a real thing. It works because
// the annoyance is concrete — a named machine, a named day, a named
// hour, three leaves — and the anger is the shared kind: not rage at
// the world, just the tired fury of being woken up by a job that
// accomplishes nothing.
//
// This program writes that rant, and only that rant, to entry.txt.
// It takes no arguments, reads no input, touches no network, looks
// at no clock, and rolls no dice. Every run writes the same bytes.
//
// Node standard library only.

import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// The rant itself: 305 characters, one paragraph, no trailing newline.
// Keep it under the contest cap of 400 characters; the check below
// enforces that before anything is written.
const RANT =
  'My neighbour fires up his leaf blower every Saturday at 7am to move three leaves from his driveway onto mine. ' +
  'Six years, same three leaves, they never leave. ' +
  'He is not cleaning anything. ' +
  'He is watering the leaves with noise while the rest of us lie there pretending Saturday morning is still a real thing.';

const CHARACTER_LIMIT = 400;
const FILE_NAME = 'entry.txt';

function countCharacters(text: string): number {
  // Spread into code points, so a character outside the basic plane
  // counts once, the way the gate counts it.
  return [...text].length;
}

function findProblem(text: string): string | null {
  const length = countCharacters(text);
  if (length === 0) return 'the rant is empty';
  if (text.trim().length === 0) return 'the rant is only whitespace';
  if (length > CHARACTER_LIMIT) {
    return `the rant is ${length} characters, over the ${CHARACTER_LIMIT} limit`;
  }
  if (text.includes('\n') || text.includes('\r')) {
    return 'the rant must be a single paragraph with no line breaks';
  }
  return null;
}

function outputDirectory(): string {
  const override = process.env.MAKEFUN_OUTPUT_DIR;
  if (override !== undefined && override !== '') return override;
  return '/output';
}

function main(): void {
  const problem = findProblem(RANT);
  if (problem !== null) {
    process.stderr.write(`rant: ${problem}\n`);
    process.exit(1);
  }

  const directory = outputDirectory();
  mkdirSync(directory, { recursive: true });

  const target = join(directory, FILE_NAME);
  writeFileSync(target, RANT, 'utf-8');

  // Read it back and refuse to report success unless the bytes on
  // disk are exactly the rant above.
  const onDisk = readFileSync(target, 'utf-8');
  if (onDisk !== RANT) {
    process.stderr.write('rant: the file on disk does not match the rant\n');
    process.exit(1);
  }

  // A string match can still hide an encoding slip, so compare the
  // byte length of what landed on disk with the rant's own byte
  // length in UTF-8, and fail loudly if the two disagree.
  const writtenBytes = Buffer.byteLength(onDisk, 'utf-8');
  const expectedBytes = Buffer.byteLength(RANT, 'utf-8');
  if (writtenBytes !== expectedBytes) {
    process.stderr.write(
      `rant: byte length mismatch on disk (${writtenBytes} bytes, expected ${expectedBytes})\n`,
    );
    process.exit(1);
  }

  const digest = createHash('sha256').update(onDisk, 'utf-8').digest('hex');
  process.stdout.write(
    `rant: wrote ${target} (${countCharacters(RANT)} characters, sha256 ${digest})\n`,
  );
}

main();
