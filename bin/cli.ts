import {Command} from 'commander';
import {KeyStoreManager, Zenon} from "znn-ts-sdk";
import {KeyPair} from "znn-ts-sdk/dist/lib/src/wallet/keypair";


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
  wallet.decrypt
  wallet.new [name]
  wallet.list`

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

    console.log(keyPair);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
