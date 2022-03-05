process.stdout.write('Type "E" to exit, type "H" to say hello!');

process.stdin.on('readable', () => {

  const input = process.stdin.read();

  const instruction = input.toString().trim();
  if (instruction === 'E') {
    process.stdout.write('Exiting app...');
    process.exit();
  }
  else if (instruction === 'H') {
    process.stdout.write('Hi! How are you?');;
  }
  else {
    process.stdout.write('Wrong instruction!\n');
  }

});