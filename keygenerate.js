const { existsSync, readFileSync, writeFileSync } = require('fs');
const readline = require('readline-sync');
const { ML_DSA_87: Dilithium5 } = require("@noble/post-quantum");

async function generateKeyPair() {
  console.log('Generating ML-DSA-87 (Dilithium 5) key pair...');

  const keyPair = await Dilithium5.generateKeyPair();

  const privateKeyFileName = 'private_key.pem';
  const publicKeyFileName = 'public_key.pem';

  writeFileSync(privateKeyFileName, Buffer.from(keyPair.privateKey));
  writeFileSync(publicKeyFileName, Buffer.from(keyPair.publicKey));

  console.log(`Private key saved to ${privateKeyFileName}`);
  console.log(`Public key saved to ${publicKeyFileName}`);
}

async function verifyFileSignature() {
  const publicKeyFileName = readline.question('Enter public key file name (e.g., public_key.pem): ');
  const signedFileName = readline.question('Enter signed file name (e.g., signed_file.txt): ');
  const signatureFileName = readline.question('Enter signature file name (e.g., signature.sig): ');

  if (!existsSync(publicKeyFileName) || !existsSync(signedFileName) || !existsSync(signatureFileName)) {
    console.error('One or more files not found.');
    return;
  }

  const publicKey = readFileSync(publicKeyFileName);
  const signedFile = readFileSync(signedFileName);
  const signature = readFileSync(signatureFileName);

  try {
    const isValid = await Dilithium5.verify(signature, signedFile, publicKey);
    if (isValid) {
      console.log('Signature is valid.');
    } else {
      console.error('Signature is invalid.');
    }
  } catch (error) {
    console.error('Error during verification:', error);
  }
}

async function clearSignFile() {
  const privateKeyFileName = readline.question('Enter private key file name (e.g., private_key.pem): ');
  const inputFileName = readline.question('Enter file to be signed (e.g., message.txt): ');
  const outputFileName = readline.question('Enter output file name for clear-signed message (e.g., message.asc): ');

  if (!existsSync(privateKeyFileName) || !existsSync(inputFileName)) {
    console.error('Private key file or input file not found.');
    return;
  }

  const privateKey = readFileSync(privateKeyFileName);
  const message = readFileSync(inputFileName);

  const signature = await Dilithium5.sign(message, privateKey);

  const clearSignedMessage = `-----BEGIN PGP SIGNED MESSAGE-----
Hash: SHA512

${message.toString()}
-----BEGIN PGP SIGNATURE-----

${Buffer.from(signature).toString('base64')}
-----END PGP SIGNATURE-----`;

  writeFileSync(outputFileName, clearSignedMessage);
  console.log(`Clear-signed message written to ${outputFileName}`);
}

async function main() {
  while (true) {
    console.log('\nMenu:');
    console.log('1. Generate ML-DSA-87 Key Pair');
    console.log('2. Verify File Signature');
    console.log('3. Clear-Sign a File');
    console.log('4. Exit');

    const choice = readline.questionInt('Enter your choice: ');

    switch (choice) {
      case 1:
        await generateKeyPair();
        break;
      case 2:
        await verifyFileSignature();
        break;
      case 3:
        await clearSignFile();
        break;
      case 4:
        console.log('Exiting...');
        process.exit(0);
      default:
        console.error('Invalid choice. Please try again.');
    }
  }
}

main().catch(console.error);
