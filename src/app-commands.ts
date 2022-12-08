export function registerAppCommands(program) {
  const app = program
  .command('app')
  .description('App related commands');

  app
  .command('set-reward-addr')
  .description(
    'Sets the Shardeum reward address'
  )
  .argument('<address>', 'Reward address')
  .action((address) => {
    console.log(`Set reward address to: ${address}`);
  });
}