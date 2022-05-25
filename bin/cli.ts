import {Command} from 'commander';
import {KeyStoreManager, Zenon} from "znn-ts-sdk";
import {KeyPair} from "znn-ts-sdk/dist/lib/src/wallet/keypair";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function never() {
  return new Promise(() => {
  });
}

async function setupKeyPair(options: any): Promise<KeyPair | null> {
  if (('passphrase' in options) && ('keyStore' in options)) {
    const manager = new KeyStoreManager();
    const store = await manager.readKeyStore(options.passphrase, options.keyStore)
    return store.getKeyPair()
  }

  return null
}

async function setupNode(options: any) {
  const zenon = Zenon.getSingleton();
  return zenon.initialize(options.url);
}

const helpText = `Commands
  listen.momentums
  listen.allAccountBlocks`

async function main() {
  const program = new Command();

  program
    .name('znn-cli.js')
    .description('CLI for interacting with Zenon ecosystem')
    .option(`-p, --passphrase <passphrase>`, 'use this passphrase for the keyStore')
    .option(`-k, --keyStore <keyStore>`, 'select the local keyStore')
    .option(`-u, --url <url>`, 'websocket/http znnd connection URL with a port', 'ws://139.177.178.226:35998')
    .addHelpText('after', `\n${helpText}`);

  program.parse();
  const options = program.opts()
  const args = program.args;

  await setupNode(options);
  const keyPair = await setupKeyPair(options);

  const zenon = Zenon.getSingleton();

  switch (args[0]) {
    case 'listen.momentums': {
      if (args.length !== 1) {
        throw "invalid usage; listen.momentums"
      }

      const subscription = await zenon.subscribe.toMomentums();
      subscription.onNotification((data) => {
        console.log(`Received new Momentum! Height:${data[0].height} Hash:${data[0].hash} CurrentTime:${new Date()}`)
      })

      await never()
      break;
    }
    case 'listen.allAccountBlocks': {
      if (args.length !== 1) {
        throw "invalid usage; listen.allAccountBlocks"
      }

      const subscription = await zenon.subscribe.toAllAccountBlocks()
      subscription.onNotification((data) => {
        for (const block of data) {
          console.log(`Received new Account Block! Address:${block.address} Height:${block.height} Hash:${block.hash} CurrentTime:${new Date()}`)
        }
      })

      await never()
      break;
    }
    default: {
      console.log(`unknown command "${args[0]}"\n`);
      console.log(helpText);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
